const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const getHeaders = () => {
    const token = localStorage.getItem("token"); // Consistency match with walletAPI
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
};

/**
 * Fetch high-level corporate statistics
 */
export const getOperationalStats = async (officeId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/polling/stats?office_id=${officeId}&date=${today}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        if (!response.ok) throw new Error("Failed to fetch stats");
        
        const json = await response.json();
        const stats = json.data;
        
        return {
            activeRides: stats.rides.find(s => s._id === "BOOKED")?.count || 0,
            activeClusters: stats.clustering.length,
            inTransit: stats.batched.find(s => s._id === "IN_TRANSIT")?.count || 0,
            totalSpendMonth: stats.finance.monthlySpend,
            savingsIndex: stats.finance.savingsIndex,
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        throw error;
    }
};

/**
 * Fetch recent transit activities (Batched rides)
 */
export const getRecentBookings = async (officeId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/polling/batches?office_id=${officeId}&scheduled_at=${today}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        
        if (!response.ok) throw new Error("Failed to fetch batches");
        
        const json = await response.json();
        return json.data.batches;
    } catch (error) {
        console.error("Error fetching recent bookings:", error);
        throw error;
    }
};

/**
 * Fetch all office wallet details
 */
export const getCorporationBalance = async (officeId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/wallet/${officeId}`, { // Match walletAPI route
            method: 'GET',
            headers: getHeaders(),
        });
        
        if (!response.ok) throw new Error("Failed to fetch balance");
        
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        throw error;
    }
};

/**
 * Search for employees within the office
 */
export const searchEmployees = async (query, officeId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/search?query=${query}&office_id=${officeId}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Search failed");
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error searching employees:", error);
        throw error;
    }
};

/**
 * Get a specific employee's latest ride status for the admin summary
 */
export const getEmployeeRideStatus = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ride/admin/summary/${userId}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Status fetch failed");
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching employee status:", error);
        throw error;
    }
};

/**
 * Get office details including physical coordinates
 */
export const getOfficeDetails = async (officeId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/office/${officeId}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Office fetch failed");
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching office details:", error);
        throw error;
    }
};

/**
 * Fetch all employees for the given office ID
 */
export const getOfficeEmployees = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/office-employees`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch office employees");
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching office employees:", error);
        throw error;
    }
};

/**
 * Add a new employee
 */
export const addEmployee = async (employeeData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/add-user`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(employeeData),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Failed to add employee");
        return json.data;
    } catch (error) {
        console.error("Error adding employee:", error);
        throw error;
    }
};

/**
 * Update office details including start/end time and working days
 */
export const updateOfficeSettings = async (officeId, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/office/${officeId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Failed to update office");
        return json.data;
    } catch (error) {
        console.error("Error updating office:", error);
        throw error;
    }
};

/**
 * Fetch all ride history for an office
 */
export const getOfficeRidesHistory = async (officeId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ride/office/${officeId}/history`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Failed to fetch ride history");
        return json.data;
    } catch (error) {
        console.error("Error fetching ride history:", error);
        throw error;
    }
};
