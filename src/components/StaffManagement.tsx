import { useState } from 'react';
import { Staff } from '../App';
import { UsersRound, Plus, Edit2, Trash2, Shield, Eye } from 'lucide-react';

interface StaffManagementProps {
  staff: Staff[];
  onAddStaff: (staff: Omit<Staff, 'id'>) => void;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => void;
  onDeleteStaff: (id: string) => void;
}

export function StaffManagement({ staff, onAddStaff, onUpdateStaff, onDeleteStaff }: StaffManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    viewReports: false,
    addCredit: false,
    manageCustomers: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffData = {
      name: formData.name,
      role: formData.role,
      permissions: {
        viewReports: formData.viewReports,
        addCredit: formData.addCredit,
        manageCustomers: formData.manageCustomers,
      },
    };

    if (editingStaff) {
      onUpdateStaff(editingStaff.id, staffData);
    } else {
      onAddStaff(staffData);
    }

    setFormData({ name: '', role: '', viewReports: false, addCredit: false, manageCustomers: false });
    setShowForm(false);
    setEditingStaff(null);
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      role: staffMember.role,
      viewReports: staffMember.permissions.viewReports,
      addCredit: staffMember.permissions.addCredit,
      manageCustomers: staffMember.permissions.manageCustomers,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', role: '', viewReports: false, addCredit: false, manageCustomers: false });
    setShowForm(false);
    setEditingStaff(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <UsersRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your sales team (max 3 staff)
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              if (staff.length >= 3) {
                alert('Maximum 3 staff members allowed');
                return;
              }
              setShowForm(true);
            }}
            disabled={staff.length >= 3}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              staff.length >= 3
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-5 h-5" />
            Add Staff
          </button>
        )}
      </div>

      {/* Staff Count */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-blue-900 dark:text-blue-100">
          {staff.length} of 3 staff members added
        </p>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-gray-900 dark:text-white mb-4">
            {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Staff member name"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="e.g., Sales Assistant"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.viewReports}
                    onChange={(e) => setFormData({ ...formData, viewReports: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">View Reports</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.addCredit}
                    onChange={(e) => setFormData({ ...formData, addCredit: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Add Credit</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.manageCustomers}
                    onChange={(e) => setFormData({ ...formData, manageCustomers: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Manage Customers</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingStaff ? 'Update' : 'Add'} Staff
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      {staff.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <UsersRound className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No staff members yet. Add your first staff member to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((staffMember) => (
            <div
              key={staffMember.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="mb-4">
                <h3 className="text-gray-900 dark:text-white mb-1">{staffMember.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{staffMember.role}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-2">Permissions:</p>
                <div className="space-y-1">
                  {staffMember.permissions.viewReports && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>View Reports</span>
                    </div>
                  )}
                  {staffMember.permissions.addCredit && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>Add Credit</span>
                    </div>
                  )}
                  {staffMember.permissions.manageCustomers && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="w-4 h-4" />
                      <span>Manage Customers</span>
                    </div>
                  )}
                  {!staffMember.permissions.viewReports && !staffMember.permissions.addCredit && !staffMember.permissions.manageCustomers && (
                    <p className="text-gray-500 dark:text-gray-400">No permissions set</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(staffMember)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Remove ${staffMember.name} from staff?`)) {
                      onDeleteStaff(staffMember.id);
                    }
                  }}
                  className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
