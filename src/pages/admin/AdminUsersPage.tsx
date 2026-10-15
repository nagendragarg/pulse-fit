import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Shield,
  Award,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import { User, UserRole, UserStatus } from '../../types/index.ts';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirm
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<User[]>(`/admin/users?search=${search}&role=${roleFilter}&status=${statusFilter}`);
      setUsers(data);
    } catch (err: any) {
      error(err.message || 'Failed to load users', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (user: User) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${user.id}/status`, { status: nextStatus });
      success(`Status for ${user.name} changed to ${nextStatus}.`, 'Updated');
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Status update failed', 'Error');
    }
  };

  const handleChangeRole = async (user: User, newRole: UserRole) => {
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      success(`Role for ${user.name} modified to ${newRole}.`, 'Role Changed');
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Role change failed', 'Error');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      success(`User ${userToDelete.name} deleted successfully.`, 'Account Removed');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Failed to delete user', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    setIsCreating(true);
    try {
      await api.post('/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });

      success(`New account for ${newName} created!`, 'User Created');
      setShowCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Creation failed', 'Error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User & Role Governance</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage athlete accounts, coaching staff, role permissions, and access states
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Provision New User
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Athletes (USER)</option>
            <option value="COACH">Coaches (COACH)</option>
            <option value="ADMIN">Administrators (ADMIN)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
        {/* Mobile View: User Cards */}
        <div className="md:hidden space-y-3">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div key={u.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden text-xs">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        {u.name} {isSelf && <span className="text-[10px] text-zinc-500 font-mono">(You)</span>}
                      </div>
                      <div className="text-[11px] text-zinc-400">{u.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => !isSelf && handleToggleStatus(u)}
                    disabled={isSelf}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:opacity-80'}`}
                  >
                    {u.status}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-850 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-medium">Role:</span>
                    {isSelf ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                        {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                        className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200"
                      >
                        <option value="USER">USER</option>
                        <option value="COACH">COACH</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors min-h-[38px] flex items-center gap-1"
                      title="Delete user account"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[11px] text-rose-400">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No users found matching your filters.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Registered</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden text-xs">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            {u.name} {isSelf && <span className="text-[10px] text-zinc-500 font-mono">(You)</span>}
                          </div>
                          <div className="text-[10px] text-zinc-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      {isSelf ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                          {u.role}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                          className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200"
                        >
                          <option value="USER">USER</option>
                          <option value="COACH">COACH</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>

                    <td className="py-4">
                      <button
                        onClick={() => !isSelf && handleToggleStatus(u)}
                        disabled={isSelf}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {u.status}
                      </button>
                    </td>

                    <td className="py-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Provision New User" maxWidth="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="rachel@pulsefit.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Initial Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Account Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
            >
              <option value="USER">Athlete (USER)</option>
              <option value="COACH">Coach Instructor (COACH)</option>
              <option value="ADMIN">Platform Administrator (ADMIN)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-all shadow-md"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title={`Delete Account: ${userToDelete?.name}?`}
        message={`Are you sure you want to permanently delete the account for ${userToDelete?.email}? All associated workout assignments and records will be deleted. This action cannot be undone.`}
        confirmText="Delete Account"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
