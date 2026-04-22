import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, Search, Trash2, History, BarChart2, CheckCircle2, X, User as UserIcon, Edit2, ShieldAlert, AlertCircle } from 'lucide-react';
import { getOfficeEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../services/adminAPI';
import { getCurrentUser } from '../../services/authAPI';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New States for Update and Delete
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  
  const [updateEmployeeData, setUpdateEmployeeData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });

  const [notification, setNotification] = useState({
    message: '',
    type: 'success', // 'success' | 'error'
    isVisible: false
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getOfficeEmployees();
      const formatted = data.map(user => ({
        id: user._id,
        name: `${user.name?.first_name || ''} ${user.name?.last_name || ''}`.trim() || 'Unknown User',
        email: user.email,
        contact: user.contact || 'N/A',
        totalSpend: user.total_carpool_spent || 0,
        rides: user.total_rides || 0
      }));
      setEmployees(formatted);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openUpdateModal = (emp) => {
    const nameParts = emp.name.split(' ');
    setSelectedEmployee(emp);
    setUpdateEmployeeData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: emp.email || '',
      phone: emp.contact || '',
      address: emp.address || '',
      password: '' // Don't pre-fill password for security
    });
    setShowUpdateModal(true);
  };

  const openDeleteModal = (emp) => {
    setSelectedEmployee(emp);
    setDeleteConfirmName('');
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        name: {
          first_name: updateEmployeeData.firstName,
          last_name: updateEmployeeData.lastName
        },
        email: updateEmployeeData.email,
        contact: updateEmployeeData.phone,
        home_address: updateEmployeeData.address,
      };

      if (updateEmployeeData.password) {
        payload.password = updateEmployeeData.password;
      }

      await updateEmployee(selectedEmployee.id, payload);
      setShowUpdateModal(false);
      fetchEmployees();
      showNotification('Employee updated successfully!', 'success');
    } catch (error) {
      showNotification(error.message || "Failed to update employee", 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (deleteConfirmName !== selectedEmployee.name) {
      alert("Employee name does not match!");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEmployee(selectedEmployee.id);
      setShowDeleteModal(false);
      fetchEmployees();
      showNotification('Employee removed successfully!', 'success');
    } catch (error) {
      showNotification(error.message || "Failed to delete employee", 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const adminUser = getCurrentUser();
      if (!adminUser) throw new Error("Admin not logged in");

      const payload = {
        company_id: adminUser.company_id,
        office_id: adminUser.office_id,
        name: {
          first_name: newEmployee.firstName,
          last_name: newEmployee.lastName
        },
        email: newEmployee.email,
        contact: newEmployee.phone,
        password: newEmployee.password,
        role: "EMPLOYEE"
      };

      await addEmployee(payload);
      
      setNewEmployee({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      setShowAddModal(false);
      fetchEmployees();
      showNotification('Employee added successfully!', 'success');
    } catch (error) {
      showNotification(error.message || "Failed to add employee", 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const searchStr = searchTerm.toLowerCase();
    return emp.name.toLowerCase().includes(searchStr) || 
           emp.email.toLowerCase().includes(searchStr) || 
           emp.contact.toLowerCase().includes(searchStr);
  });

  return (
    <div className="relative space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Custom Notification Toast */}
      {notification.isVisible && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-red-500" />}
          <p className="text-sm font-bold">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Employee Management</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage corporate cab users and track their usage.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-dash-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20 active:scale-95"
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search & Tagline Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-dash-border flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-[2] w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or contact..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/10 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-dash-border overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-8 h-8 border-4 border-dash-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-dash-muted">
            <Users size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">{searchTerm ? 'No matching employees found' : 'No employees found'}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dash-border bg-gray-50/50">
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider">Employee</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider">Contact Number</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-center">Total Spend (Carpool)</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-center">Total Rides</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dash-bg flex items-center justify-center font-bold text-dash-blue">
                        {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dash-text">{emp.name}</p>
                        <p className="text-[11px] text-dash-muted font-bold truncate max-w-[150px]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-dash-text">{emp.contact}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dash-bg text-dash-text border border-dash-border">
                        ₹{(emp.totalSpend || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-dash-text text-center">{emp.rides}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openUpdateModal(emp)}
                        className="p-2 text-dash-muted hover:text-dash-blue hover:bg-dash-blue/5 rounded-lg transition-all" 
                        title="Update Information"
                      >
                        <UserIcon size={18} />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(emp)}
                        className="p-2 text-dash-muted hover:text-dash-red hover:bg-dash-red/5 rounded-lg transition-all" 
                        title="Remove Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-dash-text">Add New Employee</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  placeholder="10-digit number"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Sign-In Password</span>
                  <span className="text-[10px] text-dash-blue bg-dash-blue/10 px-2 py-0.5 rounded-full">For Main App</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  placeholder="Create a secure password"
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white border border-dash-border text-dash-text text-sm font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-3 bg-dash-blue text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isAdding ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Employee Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Edit2 size={20} className="text-dash-blue" />
                <h2 className="text-xl font-bold text-dash-text">Update Employee</h2>
              </div>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    value={updateEmployeeData.firstName}
                    onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    value={updateEmployeeData.lastName}
                    onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={updateEmployeeData.email}
                  onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={updateEmployeeData.phone}
                  onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Home Address (Optional)</label>
                <input
                  type="text"
                  value={updateEmployeeData.address}
                  onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  placeholder="Enter resident address"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-dash-muted uppercase tracking-wider">Reset Sign-In Password</label>
                <input
                  type="password"
                  minLength={6}
                  value={updateEmployeeData.password}
                  onChange={(e) => setUpdateEmployeeData({...updateEmployeeData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/20 focus:bg-white focus:border-dash-blue transition-all outline-none font-medium"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-3 bg-white border border-dash-border text-dash-text text-sm font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-dash-blue text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Safe Delete) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-dash-red rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-bold text-dash-text mb-2">Safe Delete Confirmation</h2>
              <p className="text-sm text-dash-muted mb-6">
                This action cannot be undone. To confirm, please type <span className="font-bold text-dash-text">"{selectedEmployee?.name}"</span> below.
              </p>
              
              <form onSubmit={handleDeleteSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Type employee name exactly"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    className="w-full px-4 py-3 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-red-500/20 focus:bg-white focus:border-red-500 transition-all outline-none font-bold text-center"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-white border border-dash-border text-dash-text text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirmName !== selectedEmployee?.name}
                    className="flex-1 px-4 py-3 bg-dash-red text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
