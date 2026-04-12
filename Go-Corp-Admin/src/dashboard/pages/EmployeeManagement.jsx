import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, Search, Trash2, History, BarChart2, CheckCircle2, X } from 'lucide-react';
import { getOfficeEmployees, addEmployee } from '../../services/adminAPI';
import { getCurrentUser } from '../../services/authAPI';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await getOfficeEmployees();
      const formatted = data.map(user => ({
        id: user._id,
        name: `${user.name?.first_name || ''} ${user.name?.last_name || ''}`.trim() || 'Unknown User',
        dept: user.role === 'EMPLOYEE' ? 'General' : user.role,
        usage: 'Medium',
        rides: 0,
        status: 'Active'
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

  const simulateBulkUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert('Bulk upload functionality coming soon!');
    }, 1500);
  };

  const removeEmployee = (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
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
      alert('Employee added successfully!');
    } catch (error) {
      alert(error.message || "Failed to add employee");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Employee Management</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage corporate cab users and track their usage.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={simulateBulkUpload}
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-dash-border rounded-2xl text-sm font-bold text-dash-text hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-dash-blue border-t-transparent rounded-full animate-spin" />
            ) : <Upload size={18} />}
            Bulk Upload (CSV)
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-dash-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20 active:scale-95"
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-dash-border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or department..." 
            className="w-full pl-12 pr-4 py-3 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/10 focus:bg-white focus:border-dash-blue transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="bg-dash-bg border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-dash-text outline-none focus:ring-2 focus:ring-dash-blue/10">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>
          <select className="bg-dash-bg border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-dash-text outline-none focus:ring-2 focus:ring-dash-blue/10">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-dash-border overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-8 h-8 border-4 border-dash-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-dash-muted">
            <Users size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">No employees found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dash-border bg-gray-50/50">
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider">Employee</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider">Department</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-center">Usage frequency</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-center">Total Rides</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-center">Status</th>
                <th className="px-8 py-5 text-xs uppercase font-bold text-dash-muted tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-dash-bg flex items-center justify-center font-bold text-dash-blue">
                        {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dash-text">{emp.name}</p>
                        <p className="text-[11px] text-dash-muted font-bold truncate max-w-[120px]">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-dash-text">{emp.dept}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.usage === 'High' ? 'bg-green-100 text-green-700' :
                        emp.usage === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.usage}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-dash-text text-center">{emp.rides}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs font-bold text-dash-text">{emp.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-dash-muted hover:text-dash-blue hover:bg-dash-blue/5 rounded-lg transition-all" title="View History">
                        <History size={18} />
                      </button>
                      <button className="p-2 text-dash-muted hover:text-dash-blue hover:bg-dash-blue/5 rounded-lg transition-all" title="View Analytics">
                        <BarChart2 size={18} />
                      </button>
                      <button 
                        onClick={() => removeEmployee(emp.id)}
                        className="p-2 text-dash-muted hover:text-dash-red hover:bg-dash-red/5 rounded-lg transition-all" 
                        title="Remove"
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
                <p className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1">
                  Share this password with the employee so they can login to the rider app.
                </p>
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
    </div>
  );
}
