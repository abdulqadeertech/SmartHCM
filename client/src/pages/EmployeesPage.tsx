import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Calendar,
  CreditCard,
  Clock,
  Shield,
  Layers,
  ArrowLeft,
  Edit2,
  Trash2,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'department'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRawCsv, setImportRawCsv] = useState('');
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Selected Employee & Profile Drawer Tabs
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'compensation' | 'leaves' | 'documents'>('overview');

  // Document Upload State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'ID_PROOF',
    fileUrl: '',
    expiryDate: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designationId: '',
    branchId: '',
    baseSalary: '7500',
    employmentType: 'FULL_TIME',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, desigRes, branchRes] = await Promise.all([
        apiRequest(`/employees?search=${encodeURIComponent(search)}&departmentId=${selectedDept}`),
        apiRequest('/organizations/departments'),
        apiRequest('/organizations/designations'),
        apiRequest('/organizations/branches'),
      ]);
      setEmployees(empRes?.data || []);
      setDepartments(deptRes?.data || []);
      setDesignations(desigRes?.data || []);
      setBranches(branchRes?.data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedDept]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      success('Employee profile provisioned successfully!');
      setShowCreateModal(false);
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        designationId: '',
        branchId: '',
        baseSalary: '7500',
        employmentType: 'FULL_TIME',
      });
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create employee profile');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await apiRequest(`/employees/${id}`);
      setSelectedEmployee(res?.data || null);
      setActiveProfileTab('overview');
    } catch (err: any) {
      toastError('Failed to fetch employee details');
    }
  };

  // Edit Employee State & Handlers
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    departmentId: '',
    designationId: '',
    branchId: '',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    baseSalary: '7500',
    address: '',
  });

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setEditFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      phone: emp.phone || '',
      departmentId: emp.departmentId || '',
      designationId: emp.designationId || '',
      branchId: emp.branchId || '',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
      employmentType: emp.employmentType || 'FULL_TIME',
      baseSalary: emp.salaryRecord?.baseSalary ? String(emp.salaryRecord.baseSalary) : '7500',
      address: emp.address || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setIsSubmittingEdit(true);
    try {
      await apiRequest(`/employees/${editingEmployee.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editFormData),
      });
      success('Employee profile updated successfully!');
      setShowEditModal(false);
      if (selectedEmployee && selectedEmployee.id === editingEmployee.id) {
        handleViewDetails(editingEmployee.id);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update employee profile');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode})?\n\nThis will remove all associated documents, leave balances, attendance, and payroll records. This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await apiRequest(`/employees/${emp.id}`, {
        method: 'DELETE',
      });
      success(`Employee ${emp.firstName} ${emp.lastName} deleted successfully`);
      if (selectedEmployee && selectedEmployee.id === emp.id) {
        setSelectedEmployee(null);
      }
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete employee profile');
    }
  };

  const isPrivileged =
    user?.isSuperAdmin ||
    ['ORG_ADMIN', 'HR_DIRECTOR', 'HR_MANAGER', 'HR_OFFICER'].includes(user?.role || '');

  // Filter & Sort
  const filteredEmployees = employees.filter((emp) => {
    if (selectedStatus && emp.employmentStatus !== selectedStatus) return false;
    return true;
  });

  filteredEmployees.sort((a, b) => {
    let fieldA = '';
    let fieldB = '';
    if (sortBy === 'name') {
      fieldA = `${a.firstName} ${a.lastName}`.toLowerCase();
      fieldB = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortBy === 'code') {
      fieldA = a.employeeCode.toLowerCase();
      fieldB = b.employeeCode.toLowerCase();
    } else if (sortBy === 'department') {
      fieldA = (a.department?.name || '').toLowerCase();
      fieldB = (b.department?.name || '').toLowerCase();
    }
    if (sortOrder === 'asc') return fieldA.localeCompare(fieldB);
    return fieldB.localeCompare(fieldA);
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedEmployees.map((e) => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['Employee Code', 'First Name', 'Last Name', 'Email', 'Department', 'Designation', 'Status'];
    const rows = (selectedIds.length > 0
      ? employees.filter((e) => selectedIds.includes(e.id))
      : filteredEmployees
    ).map((e) => [
      e.employeeCode,
      e.firstName,
      e.lastName,
      e.email,
      e.department?.name || '',
      e.designation?.name || '',
      e.employmentStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((f) => `"${f}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exported employee directory to CSV file');
  };

  const handleDownloadCsvTemplate = () => {
    const headers = ['employeeCode', 'firstName', 'lastName', 'email', 'phone', 'department', 'designation', 'baseSalary', 'employmentType'];
    const sampleRows = [
      ['EMP-101', 'Alexander', 'Wright', 'alex.wright@company.com', '+1-555-0142', 'Engineering', 'Senior Developer', '8500', 'FULL_TIME'],
      ['EMP-102', 'Sophia', 'Chen', 'sophia.chen@company.com', '+1-555-0143', 'Marketing', 'Product Marketing Lead', '7800', 'FULL_TIME'],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'smarthcm_employee_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  };

  const handleDryRunValidation = async () => {
    const parsed = parseCsvText(importRawCsv);
    if (parsed.length === 0) {
      toastError('Please enter valid CSV data with header and data rows');
      return;
    }
    setIsImporting(true);
    try {
      const res = await apiRequest('/employees/import', {
        method: 'POST',
        body: JSON.stringify({ employees: parsed, dryRun: true }),
      });
      setImportPreview(res?.data);
      success('Validated CSV records preview successfully');
    } catch (err: any) {
      toastError(err?.message || 'Failed to validate CSV import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCommitImport = async () => {
    const parsed = parseCsvText(importRawCsv);
    setIsImporting(true);
    try {
      const res = await apiRequest('/employees/import', {
        method: 'POST',
        body: JSON.stringify({ employees: parsed, dryRun: false }),
      });
      success(`Imported ${res?.data?.importedCount || parsed.length} employees successfully!`);
      setShowImportModal(false);
      setImportRawCsv('');
      setImportPreview(null);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to complete employee import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      await apiRequest(`/employees/${selectedEmployee.id}/documents`, {
        method: 'POST',
        body: JSON.stringify(newDocForm),
      });
      success('Compliance document added successfully');
      setNewDocForm({ title: '', category: 'ID_PROOF', fileUrl: '', expiryDate: '' });
      setShowAddDocModal(false);
      handleViewDetails(selectedEmployee.id);
    } catch (err: any) {
      toastError(err?.message || 'Failed to add document');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Core HR', to: '/employees' },
          { label: 'Employee Directory' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Users className="text-[#ff6f32]" size={22} />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage organization members, departments, compensation records, and employment status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isPrivileged && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => {
                setShowImportModal(true);
                setImportPreview(null);
              }}
            >
              Import CSV
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          {isPrivileged && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus size={15} />}
              onClick={() => setShowCreateModal(true)}
            >
              Add New Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#08222f] p-4 rounded-2xl border border-[#14425b] shadow-card flex flex-col md:flex-row gap-3 transition-colors">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#051822] border border-[#14425b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
          >
            <option value="" className="bg-[#08222f] text-white">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#051822] border border-[#14425b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
          >
            <option value="" className="bg-[#08222f] text-white">All Statuses</option>
            <option value="ACTIVE" className="bg-[#08222f] text-white">Active</option>
            <option value="PROBATION" className="bg-[#08222f] text-white">Probation</option>
            <option value="ON_LEAVE" className="bg-[#08222f] text-white">On Leave</option>
            <option value="TERMINATED" className="bg-[#08222f] text-white">Terminated</option>
          </select>

          {/* Sort By */}
          <button
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            }}
            className="px-3 py-2 bg-[#051822] border border-[#14425b] rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#071c26] flex items-center space-x-1.5 transition cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown size={13} className="text-[#ff6f32]" />
            <span>Sort: {sortBy} ({sortOrder.toUpperCase()})</span>
          </button>
        </div>
      </div>

      {/* Selected Action Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-[#ff6f32]/15 border border-[#ff6f32]/30 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between text-white">
          <span>{selectedIds.length} employee record(s) selected</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="font-bold text-[#ff6f32] hover:underline cursor-pointer"
            >
              Export Selected
            </button>
            <span>•</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Advanced Employee Table */}
      <div className="bg-[#08222f] rounded-2xl border border-[#14425b] shadow-card overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#071c26] border-b border-[#14425b] text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedEmployees.length > 0 &&
                      selectedIds.length === paginatedEmployees.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-[#ff6f32] focus:ring-[#ff6f32] h-3.5 w-3.5 bg-[#051822] border-[#14425b]"
                  />
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => setSortBy('name')}
                >
                  Employee
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => setSortBy('code')}
                >
                  Code
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => setSortBy('department')}
                >
                  Department
                </th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14425b]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 border-2 border-[#ff6f32] border-t-transparent rounded-full animate-spin" />
                      <span>Loading employee roster...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No employee records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isChecked = selectedIds.includes(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-[#071c26] transition ${
                        isChecked ? 'bg-[#ff6f32]/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(emp.id)}
                          className="rounded text-[#ff6f32] focus:ring-[#ff6f32] h-3.5 w-3.5 bg-[#051822] border-[#14425b]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#ff6f32]">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {emp.department?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {emp.designation?.name || 'Staff'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {emp.branch?.name || 'HQ'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            emp.employmentStatus === 'ACTIVE'
                              ? 'success'
                              : emp.employmentStatus === 'PROBATION'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="xs"
                        >
                          {emp.employmentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleViewDetails(emp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#ff6f32] hover:bg-[#051720] transition cursor-pointer"
                            title="View Profile Details"
                          >
                            <Eye size={15} />
                          </button>
                          {isPrivileged && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(emp)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#ff6f32] hover:bg-[#051720] transition cursor-pointer"
                                title="Edit Profile"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#051720] transition cursor-pointer"
                                title="Delete Employee"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#14425b] bg-[#071c26] flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredEmployees.length ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-white">
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
            </strong>{' '}
            of <strong className="text-white">{filteredEmployees.length}</strong> personnel
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#14425b] bg-[#051720] text-slate-300 hover:text-white disabled:opacity-40 hover:bg-[#08222f] transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#14425b] bg-[#051720] text-slate-300 hover:text-white disabled:opacity-40 hover:bg-[#08222f] transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#14425b] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-base">
                Provision New Employee Profile
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="EMP-101"
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Monthly Base Salary (CTC) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Direct Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32] focus:border-[#ff6f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Designation
                  </label>
                  <select
                    value={formData.designationId}
                    onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Title</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Branch
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#08222f] text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save & Provision Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Profile Detail Modal with Tabs */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-[#14425b] text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#14425b]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 rounded-xl bg-[#051720] border border-[#14425b] text-slate-400 hover:text-white transition cursor-pointer"
                  title="Back to Directory"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#051720] border border-[#14425b] text-[#ff6f32] flex items-center justify-center font-bold text-sm">
                  {selectedEmployee.firstName?.[0]}
                  {selectedEmployee.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-xs text-[#ff6f32] font-semibold">
                      {selectedEmployee.employeeCode}
                    </span>
                    <span>•</span>
                    <Badge variant="success" size="xs">
                      {selectedEmployee.employmentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Drawer Tabs */}
            <div className="flex space-x-2 border-b border-[#14425b] pt-3 pb-2 text-xs">
              <button
                onClick={() => setActiveProfileTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeProfileTab === 'overview'
                    ? 'bg-[#ff6f32] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveProfileTab('compensation')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeProfileTab === 'compensation'
                    ? 'bg-[#ff6f32] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compensation Record
              </button>
              <button
                onClick={() => setActiveProfileTab('leaves')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeProfileTab === 'leaves'
                    ? 'bg-[#ff6f32] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Leave Balances
              </button>
              <button
                onClick={() => setActiveProfileTab('documents')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeProfileTab === 'documents'
                    ? 'bg-[#ff6f32] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Documents
              </button>
            </div>

            <div className="py-4 text-xs">
              {activeProfileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-[#051720] p-4 rounded-xl border border-[#14425b]">
                    <div>
                      <span className="text-slate-400 block font-medium">Department</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.department?.name || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Designation / Title</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.designation?.name || 'Staff'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Branch Location</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.branch?.name || 'HQ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Employment Type</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.employmentType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Work Email</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Contact Phone</span>
                      <span className="font-semibold text-white">
                        {selectedEmployee.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'compensation' && (
                <div className="space-y-3">
                  {selectedEmployee.salaryRecord ? (
                    <div className="bg-[#051720] p-4 rounded-xl border border-[#14425b] space-y-2">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <CreditCard size={15} className="text-[#ff6f32]" />
                        <span>Confidential Salary Record (Masked for Peers)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 text-slate-300">
                        <div>
                          Base Salary:{' '}
                          <strong className="text-white">
                            ${selectedEmployee.salaryRecord.baseSalary?.toLocaleString()} / mo
                          </strong>
                        </div>
                        <div>
                          Currency: <strong className="text-white">{selectedEmployee.salaryRecord.currency}</strong>
                        </div>
                        <div>
                          Payment Method: <strong>{selectedEmployee.salaryRecord.paymentMethod}</strong>
                        </div>
                        <div>
                          Bank Account: <strong className="font-mono text-[#ff6f32]">{selectedEmployee.salaryRecord.accountNumber || '****4819'}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      Compensation record is masked under Role-Based Privacy policy.
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'leaves' && (
                <div className="space-y-3">
                  {selectedEmployee.leaveBalances?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      {selectedEmployee.leaveBalances.map((b: any) => (
                        <div
                          key={b.id}
                          className="bg-[#051720] p-3 rounded-xl border border-[#14425b] text-center"
                        >
                          <div className="text-[10px] text-slate-400">{b.leaveType?.name}</div>
                          <div className="text-base font-extrabold text-[#ff6f32] mt-0.5">
                            {b.allocatedDays - b.usedDays} days
                          </div>
                          <div className="text-[10px] text-slate-400">of {b.allocatedDays}d allocated</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      Standard statutory leave balances allocated.
                    </div>
                  )}
                </div>
              )}

              {activeProfileTab === 'documents' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-semibold text-white">Employee Compliance & HR Documents</span>
                    {isPrivileged && (
                      <Button
                        variant="outline"
                        size="xs"
                        leftIcon={<FileText size={12} />}
                        onClick={() => setShowAddDocModal(true)}
                      >
                        Add Document
                      </Button>
                    )}
                  </div>

                  {selectedEmployee.documents?.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedEmployee.documents.map((doc: any) => {
                        const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                        return (
                          <div
                            key={doc.id}
                            className="bg-[#051720] p-3 rounded-xl border border-[#14425b] flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-white text-xs">{doc.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
                                  {doc.category}
                                </span>
                                {doc.expiryDate && (
                                  <span className={isExpired ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isExpired && (
                                <Badge variant="danger" size="xs">
                                  EXPIRED
                                </Badge>
                              )}
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#ff6f32] hover:underline font-semibold"
                              >
                                View File
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      No compliance documents currently uploaded for this employee.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#14425b] flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft size={14} />}
                onClick={() => setSelectedEmployee(null)}
              >
                Back to Directory
              </Button>
              <div className="flex items-center space-x-2">
                {isPrivileged && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit2 size={13} />}
                      onClick={() => handleOpenEdit(selectedEmployee)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 size={13} />}
                      onClick={() => handleDeleteEmployee(selectedEmployee)}
                    >
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && selectedEmployee && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#14425b] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <h3 className="font-bold text-white text-sm">Upload Compliance Document</h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government ID / Passport"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Document Category</label>
                <select
                  value={newDocForm.category}
                  onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                >
                  <option value="ID_PROOF" className="bg-[#08222f]">Identity Proof (Passport/National ID)</option>
                  <option value="CONTRACT" className="bg-[#08222f]">Signed Employment Contract</option>
                  <option value="CERTIFICATE" className="bg-[#08222f]">Educational / Professional Certificate</option>
                  <option value="TAX" className="bg-[#08222f]">Tax Clearance / Withholding Form</option>
                  <option value="OTHER" className="bg-[#08222f]">Other Legal Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Document URL / Storage Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.smarthcm.cloud/files/..."
                  value={newDocForm.fileUrl}
                  onChange={(e) => setNewDocForm({ ...newDocForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Document Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={newDocForm.expiryDate}
                  onChange={(e) => setNewDocForm({ ...newDocForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddDocModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#14425b] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#14425b]">
              <div>
                <h3 className="font-bold text-white text-base">
                  Edit Profile: {editingEmployee.firstName} {editingEmployee.lastName}
                </h3>
                <span className="text-xs font-mono text-[#ff6f32]">
                  {editingEmployee.employeeCode}
                </span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Base Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={editFormData.baseSalary}
                    onChange={(e) => setEditFormData({ ...editFormData, baseSalary: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={editFormData.departmentId}
                    onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                  <select
                    value={editFormData.designationId}
                    onChange={(e) => setEditFormData({ ...editFormData, designationId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Designation</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#08222f] text-white">
                        {d.name || d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employment Status</label>
                  <select
                    value={editFormData.employmentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, employmentStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="ACTIVE" className="bg-[#08222f] text-white">ACTIVE</option>
                    <option value="PROBATION" className="bg-[#08222f] text-white">PROBATION</option>
                    <option value="ON_LEAVE" className="bg-[#08222f] text-white">ON_LEAVE</option>
                    <option value="TERMINATED" className="bg-[#08222f] text-white">TERMINATED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Branch</label>
                  <select
                    value={editFormData.branchId}
                    onChange={(e) => setEditFormData({ ...editFormData, branchId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                  >
                    <option value="" className="bg-[#08222f] text-white">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#08222f] text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Residential address"
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="pt-3 border-t border-[#14425b] flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmittingEdit}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Batch Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#08222f] rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-[#14425b] text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#14425b]">
              <div>
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Upload size={18} className="text-[#ff6f32]" />
                  <span>Batch Employee CSV Import</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Import employee profiles in bulk with automated duplicate detection, salary record setup, and onboarding checklists.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="flex items-center justify-between bg-[#051720] p-3 rounded-xl border border-[#14425b]">
                <div className="text-slate-300">
                  Required Columns:{' '}
                  <code className="text-[#ff6f32] bg-[#071c26] px-1 py-0.5 rounded font-mono text-[10px]">
                    employeeCode, firstName, lastName, email, phone, department, designation, baseSalary, employmentType
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Download size={12} />}
                  onClick={handleDownloadCsvTemplate}
                >
                  Download Template
                </Button>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Paste CSV Data (or upload file)
                </label>
                <textarea
                  rows={6}
                  placeholder={`employeeCode,firstName,lastName,email,phone,department,designation,baseSalary,employmentType\nEMP-101,Alexander,Wright,alex.wright@company.com,+1-555-0142,Engineering,Senior Developer,8500,FULL_TIME`}
                  value={importRawCsv}
                  onChange={(e) => {
                    setImportRawCsv(e.target.value);
                    setImportPreview(null);
                  }}
                  className="w-full px-3 py-2 bg-[#051822] border border-[#14425b] text-white rounded-xl font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#ff6f32]"
                />
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDryRunValidation}
                  isLoading={isImporting}
                  disabled={!importRawCsv.trim()}
                >
                  Validate & Preview Records
                </Button>
              </div>

              {/* Validation Preview Panel */}
              {importPreview && (
                <div className="space-y-3 pt-3 border-t border-[#14425b]">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#051720] p-2.5 rounded-xl border border-emerald-500/30">
                      <div className="text-emerald-400 font-black text-lg">
                        {importPreview.validCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">Valid Records</div>
                    </div>
                    <div className="bg-[#051720] p-2.5 rounded-xl border border-amber-500/30">
                      <div className="text-amber-400 font-black text-lg">
                        {importPreview.duplicateCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">Duplicates Detected</div>
                    </div>
                    <div className="bg-[#051720] p-2.5 rounded-xl border border-rose-500/30">
                      <div className="text-rose-400 font-black text-lg">
                        {importPreview.errorCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">Row Errors</div>
                    </div>
                  </div>

                  {/* Errors Notice */}
                  {importPreview.errors?.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-600/30 rounded-xl p-3 text-rose-200 text-xs space-y-1">
                      <div className="font-bold flex items-center space-x-1">
                        <AlertTriangle size={14} className="text-rose-400" />
                        <span>Validation Issues:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300">
                        {importPreview.errors.slice(0, 5).map((err: any, idx: number) => (
                          <li key={idx}>
                            Row {err.row} ({err.employeeCode || err.email}): {err.errors.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  {importPreview.preview?.length > 0 && (
                    <div>
                      <div className="font-semibold text-slate-300 mb-1.5">Record Preview (First 10)</div>
                      <div className="overflow-x-auto rounded-xl border border-[#14425b]">
                        <table className="w-full text-[11px] text-slate-300">
                          <thead className="bg-[#051720] text-slate-400 border-b border-[#14425b]">
                            <tr>
                              <th className="p-2 text-left">Code</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Department</th>
                              <th className="p-2 text-left">Salary</th>
                              <th className="p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#0f3446]">
                            {importPreview.preview.map((row: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="p-2 font-mono text-white">{row.employeeCode}</td>
                                <td className="p-2">{row.firstName} {row.lastName}</td>
                                <td className="p-2">{row.email}</td>
                                <td className="p-2">{row.departmentName}</td>
                                <td className="p-2 text-white font-semibold">${row.baseSalary}</td>
                                <td className="p-2">
                                  <Badge variant="success" size="xs">VALID</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#14425b] flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCommitImport}
                disabled={!importPreview || !importPreview.canImport}
                isLoading={isImporting}
              >
                Commit & Import {importPreview?.validCount || 0} Employees
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
