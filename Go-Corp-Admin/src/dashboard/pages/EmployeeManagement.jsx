import React, { useState } from 'react';
import { Users, UserPlus, Upload, Search, Trash2, History, BarChart2, CheckCircle2 } from 'lucide-react';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([
    { id: 'E001', name: 'Rahul Sharma', dept: 'Engineering', usage: 'High', rides: 45, status: 'Active' },
    { id: 'E002', name: 'Priya Verma', dept: 'Design', usage: 'Medium', rides: 28, status: 'Active' },
    { id: 'E003', name: 'Aman Deep', dept: 'Marketing', usage: 'Low', rides: 12, status: 'On Leave' },
    { id: 'E004', name: 'Sneha Rao', dept: 'HR', usage: 'Medium', rides: 31, status: 'Active' },
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const simulateBulkUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newEmployees = [
        { id: 'E005', name: 'Vikram Singh', dept: 'Sales', usage: 'Medium', rides: 0, status: 'Active' },
        { id: 'E006', name: 'Anjali Gupta', dept: 'Engineering', usage: 'Low', rides: 0, status: 'Active' },
      ];
      setEmployees([...employees, ...newEmployees]);
      setIsUploading(false);
      alert('Bulk upload successful! 2 employees added.');
    }, 1500);
  };

  const removeEmployee = (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
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
          <button className="flex items-center gap-2 px-6 py-3 bg-dash-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20 active:scale-95">
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
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-dash-border overflow-hidden">
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
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dash-text">{emp.name}</p>
                      <p className="text-[11px] text-dash-muted font-bold">{emp.id}</p>
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
      </div>
    </div>
  );
}
