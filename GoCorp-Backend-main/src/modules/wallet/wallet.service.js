import mongoose from "mongoose";
import OfficeWallet from "./wallet.model.js";
import OfficeWalletTransaction from "./walletTransaction.model.js";
import { calculateBlockedAmount } from "../../utils/fareBuffer.js";
import { sendLowBalanceEmail } from "../notification/notification.service.js";
import { User } from "../user/user.model.js";

const checkAndSendLowBalanceAlert = async (officeId, newBalance) => {
    try {
        const wallet = await OfficeWallet.findOne({ officeId });
        
        if (wallet && newBalance < 2000 && !wallet.isLowBalanceAlertSent) {
            console.log(`[WalletService] Balance is ${newBalance}, below 2000 for office ${officeId}. Triggering first-time alert.`);
            
            const admins = await User.find({ office_id: officeId, role: "OFFICE_ADMIN" });
            
            const adminEmails = admins.map(admin => admin.email).filter(Boolean);
            
            if (adminEmails.length > 0) {
                // Send email
                const success = await sendLowBalanceEmail(adminEmails, newBalance, officeId);
                
                if (success) {
                    // Mark as sent in DB only if email was successful
                    wallet.isLowBalanceAlertSent = true;
                    await wallet.save();
                    console.log(`[WalletService] Alert flag set to true for office ${officeId}.`);
                } else {
                    console.error(`[WalletService] Failed to send email alert for office ${officeId}. Flag NOT set.`);
                }
            } else {
                console.warn(`[WalletService] No OFFICE_ADMIN found for office ${officeId} to send alert.`);
            }
        }
    } catch (e) {
        console.error("[WalletService] Error triggering low balance alert:", e);
    }
};

export const addMoney = async (officeId, amount) => {

    let wallet = await OfficeWallet.findOne({ officeId });

    if (!wallet) {
        wallet = await OfficeWallet.create({
            officeId,
            balance: amount
        });
    } else {
        wallet.balance += amount;
        if (wallet.balance >= 2000) {
            wallet.isLowBalanceAlertSent = false;
        }
        await wallet.save();
    }

    await OfficeWalletTransaction.create({
        officeId,
        type: "CREDIT",
        amount,
        description: "Admin recharge"
    });

    return wallet;
};

//block money for a ride
export const blockAmount = async (officeId, estimatedFare, rideId) => {
    // Explicitly cast to ObjectId to ensure query matches database storage
    const oId = typeof officeId === 'string' ? new mongoose.Types.ObjectId(officeId) : officeId;
    const rId = typeof rideId === 'string' && rideId.length === 24 ? new mongoose.Types.ObjectId(rideId) : rideId;

    const wallet = await OfficeWallet.findOne({ officeId: oId });

    if (!wallet) throw new Error("Office wallet not found");

    const amountToBlock = calculateBlockedAmount(estimatedFare);

    if (wallet.balance < amountToBlock) {
        throw new Error("Office wallet insufficient");
    }

    const oldBalance = wallet.balance;

    wallet.balance -= amountToBlock;
    wallet.blockedBalance += amountToBlock;

    await wallet.save();

    await OfficeWalletTransaction.create({
        officeId: oId,
        type: "BLOCK",
        amount: -amountToBlock, // Store as negative for accounting clarity
        rideId: rId,
        description: "Ride booking auto block"
    });

    checkAndSendLowBalanceAlert(oId, wallet.balance);

    return wallet;
};

//deduct final fair
export const deductFinalFare = async (officeId, finalAmount, rideId) => {
    // Explicitly cast to ObjectId to ensure query matches database storage
    const oId = typeof officeId === 'string' ? new mongoose.Types.ObjectId(officeId) : officeId;
    const rId = typeof rideId === 'string' && rideId.length === 24 ? new mongoose.Types.ObjectId(rideId) : rideId;

    console.log(`[WalletService] Deducting fare for ride ${rideId}, office ${officeId}, amount ${finalAmount}`);

    const wallet = await OfficeWallet.findOne({ officeId: oId });
    if (!wallet) throw new Error("Office wallet not found");

    // Find the original BLOCK transaction
    const blockedTxn = await OfficeWalletTransaction.findOne({
        officeId: oId,
        rideId: rId,
        type: "BLOCK"
    });

    if (!blockedTxn) {
        console.error(`[WalletService] No blocked transaction found for ride ${rideId}`);
        throw new Error("No blocked amount found for this ride");
    }

    // Since we store block as negative, we take absolute for calculation
    const blockedAmount = Math.abs(blockedTxn.amount);
    console.log(`[WalletService] Found blocked transaction: ${blockedAmount}`);

    if (wallet.blockedBalance < blockedAmount) {
        // Fallback: if blockedBalance is less than this specific block (shouldn't happen),
        // we use what's available in blockedBalance or adjust
        console.warn(`[WalletService] Wallet blocked balance (${wallet.blockedBalance}) is less than specific block (${blockedAmount})`);
    }

    const oldBalance = wallet.balance;

    // 1. Clear the blocked amount from reserve
    wallet.blockedBalance = Math.max(0, wallet.blockedBalance - blockedAmount);

    // 2. Calculate if there's any remainder to release back to available balance
    const releaseAmount = blockedAmount - finalAmount;

    if (releaseAmount > 0) {
        wallet.balance += releaseAmount;
        console.log(`[WalletService] Releasing ${releaseAmount} back to balance`);

        await OfficeWalletTransaction.create({
            officeId: oId,
            type: "RELEASE",
            amount: releaseAmount, // Positive
            rideId: rId,
            description: "Auto release after final fare"
        });
    } else if (releaseAmount < 0) {
        // If final fare is MORE than blocked amount (rare but possible), deduct from available balance
        const extraDeduction = Math.abs(releaseAmount);
        wallet.balance -= extraDeduction;
        console.warn(`[WalletService] Final fare exceeded blocked amount. Extra deduction: ${extraDeduction}`);
    }

    await wallet.save();

    // 3. Record the actual DEBIT
    await OfficeWalletTransaction.create({
        officeId: oId,
        type: "DEBIT",
        amount: -finalAmount, // Store as negative
        rideId: rId,
        description: "Ride completed deduction"
    });

    console.log(`[WalletService] Successfully updated wallet. New balance: ${wallet.balance}`);
    
    checkAndSendLowBalanceAlert(oId, wallet.balance);

    return wallet;
};

//release remaining
export const releaseAmount = async (officeId, amount, rideId) => {

    const wallet = await OfficeWallet.findOne({ officeId });

    wallet.blockedBalance -= amount;
    wallet.balance += amount;

    await wallet.save();

    await OfficeWalletTransaction.create({
        officeId,
        type: "RELEASE",
        amount,
        rideId,
        description: "Ride adjustment"
    });

    return wallet;
};