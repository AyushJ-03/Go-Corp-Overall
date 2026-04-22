// test-mail.js
import nodemailer from 'nodemailer';

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "meetskymau@gmail.com",      // 👈 your Gmail
      pass: "guyamtidrudbrvsj",    // 👈 16-digit app password
    },
  });

  try {
    // Step 1: Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection successful!");

    // Step 2: Send test email
    const info = await transporter.sendMail({
      from: '"Test App" <test@gmail.com>',
      to: "shivamyadav.work05@gmail.com", // send to yourself
      subject: "SMTP Test ✔",
      text: "GAYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
    });

    console.log("📩 Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testSMTP();