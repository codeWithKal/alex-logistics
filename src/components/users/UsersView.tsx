import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const UsersView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New user modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('data_entry');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = () => {
    setIsLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch((err) => console.error('Failed to load users', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!username.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      setModalError('All fields are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createUser({
        username: username.trim(),
        full_name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });
      setIsModalOpen(false);
      setUsername('');
      setFullName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Permissions Matrix Explanation Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Alex Logistics RBAC Role &amp; Permission Structure
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Operational permissions are strictly enforced on the server and database layer. Viewers cannot modify records or change trip statuses even if requests are sent manually.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Role A */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 font-mono text-sm">Role A: Data Entry Operator</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono text-[10px]">
                data_entry
              </span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>Register &amp; update external hired trucks &amp; capacities</li>
              <li>Create &amp; edit construction companies, projects &amp; locations</li>
              <li>Record unified trips (both loading &amp; unloading fields)</li>
              <li>Update delivered quantities, shortages, and delivery statuses</li>
              <li>View dashboards and search operational delivery records</li>
              <li className="text-slate-500 italic">Cannot manage user accounts or roles</li>
            </ul>
          </div>
          {/* Role B */}
          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 font-mono text-sm">Role B: Viewer / Report Generator</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold font-mono text-[10px]">
                viewer
              </span>
            </div>
            <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
              <li>View operational dashboard and delivery register</li>
              <li>Generate Specific Truck Audit Dossiers &amp; Client Reports</li>
              <li>Filter &amp; analyze trucks, sand types, and destination volumes</li>
              <li>Compile and export reports to CSV and PDF</li>
              <li className="text-red-700 font-semibold">Strictly read-only: Backend blocks trip mutations (403)</li>
              <li className="text-red-700 font-semibold">Cannot create or update trucks, clients, or locations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Accounts Registry</h3>
            <span className="text-xs text-slate-500 font-mono">Distinct credentials and role access enforced</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 font-mono text-[11px] text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Username</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Assigned Role</th>
                <th className="py-2.5 px-4">Created Date</th>
                <th className="py-2.5 px-4 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[10px] text-amber-600 font-mono">
                              {u.full_name ? u.full_name.slice(0, 2).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="leading-tight">{u.full_name}</div>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] text-amber-700 font-mono font-bold">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{u.username}</td>
                    <td className="py-2.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'data_entry'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role === 'admin'
                          ? 'Administrator'
                          : u.role === 'data_entry'
                          ? 'Role A: Data Entry'
                          : 'Role B: Viewer'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {u.id !== currentUser?.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                          className="text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded focus:bg-white"
                        >
                          <option value="data_entry">Data Entry Operator</option>
                          <option value="viewer">Viewer / Report Generator</option>
                          <option value="admin">Administrator</option>
                        </select>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Provision New User Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-4 space-y-3">
              {modalError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded">{modalError}</div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. radams"
                  className="w-full font-mono px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@sandtrack.local"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-amber-500"
                >
                  <option value="data_entry">Role A: Data Entry Operator (Can create &amp; edit trips)</option>
                  <option value="viewer">Role B: Viewer / Report Generator (Read-only + CSV/PDF)</option>
                  <option value="admin">Administrator (Full permissions + user management)</option>
                </select>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
