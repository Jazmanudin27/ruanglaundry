import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Users,
  Plus,
  Trash2,
  KeyRound,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import showAlert from '../utils/sweetalert';

export default function ModalPengaturanAkun({ isOpen, onClose }) {
  const { user, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('profil'); // 'profil' | 'users'

  // Form Profil / Ganti Password
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);

  // Manajemen Users (untuk Admin/Owner)
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newRole, setNewRole] = useState('KASIR');
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setNama(user.nama || '');
      setUsername(user.username || '');
      setPasswordLama('');
      setPasswordBaru('');
      setKonfirmasiPassword('');
      if (user.role === 'ADMIN' || user.role === 'SUPER_OWNER') {
        fetchUsers();
      }
    }
  }, [isOpen, user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authApi.getUsers();
      if (res.data) {
        setUserList(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat daftar user:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfil = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      showAlert.error('Username wajib diisi');
      return;
    }

    if (passwordBaru) {
      if (passwordBaru.length < 4) {
        showAlert.error('Password baru minimal 4 karakter');
        return;
      }
      if (passwordBaru !== konfirmasiPassword) {
        showAlert.error('Konfirmasi password baru tidak cocok');
        return;
      }
      if (!passwordLama) {
        showAlert.error('Password lama wajib diisi untuk verifikasi keamanan');
        return;
      }
    }

    setSavingProfil(true);
    try {
      const payload = {
        nama: nama.trim(),
        username: username.trim(),
      };
      if (passwordBaru) {
        payload.passwordLama = passwordLama;
        payload.passwordBaru = passwordBaru;
      }

      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        updateUserData(res.data.admin, res.data.token);
        showAlert.success('Berhasil!', 'Profil & password berhasil diperbarui.');
        setPasswordLama('');
        setPasswordBaru('');
        setKonfirmasiPassword('');
        onClose();
      }
    } catch (err) {
      showAlert.error('Gagal Menyimpan', err.response?.data?.message || err.message || 'Terjadi kesalahan');
    } finally {
      setSavingProfil(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newNama.trim() || !newUsername.trim() || !newPassword.trim()) {
      showAlert.error('Semua kolom wajib diisi');
      return;
    }

    setAddingUser(true);
    try {
      const res = await authApi.createUser({
        nama: newNama.trim(),
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole,
      });

      if (res.success) {
        showAlert.success('Berhasil', `Akun kasir "${newNama}" berhasil dibuat.`);
        setNewNama('');
        setNewUsername('');
        setNewPassword('123456');
        setShowAddUser(false);
        fetchUsers();
      }
    } catch (err) {
      showAlert.error('Gagal Buat User', err.response?.data?.message || err.message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const yakin = await showAlert.confirm(
      'Hapus Akun?',
      `Yakin ingin menghapus user "${targetUser.nama}" (${targetUser.username})? Tindakan ini tidak dapat dibatalkan.`,
      'Ya, Hapus'
    );

    if (yakin) {
      try {
        await authApi.deleteUser(targetUser.id);
        showAlert.success('Terhapus', `Akun ${targetUser.nama} berhasil dihapus.`);
        fetchUsers();
      } catch (err) {
        showAlert.error('Gagal Hapus', err.response?.data?.message || err.message);
      }
    }
  };

  const isOwnerOrAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_OWNER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Pengaturan Akun & Keamanan</h3>
              <p className="text-xs text-sky-100">Ganti username, password, atau kelola kasir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav (Jika Admin/Owner) */}
        {isOwnerOrAdmin && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'profil'
                  ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profil Saya ({user?.nama})</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
                activeTab === 'users'
                  ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Kasir & User</span>
            </button>
          </div>
        )}

        {/* Body Konten */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'profil' ? (
            <form onSubmit={handleSaveProfil} className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>
                  Anda dapat mengubah <strong>Username</strong> login dan <strong>Password</strong> kapan saja.
                  Kosongkan password jika hanya ingin mengganti username/nama.
                </span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Misal: Muqodas / Reva / Ulul"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Username login sistem"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Ganti Password (Opsional)</h4>

                {/* Password Lama */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Password Saat Ini (Lama)</label>
                  <div className="relative">
                    <input
                      type={showPasswordLama ? 'text' : 'password'}
                      value={passwordLama}
                      onChange={(e) => setPasswordLama(e.target.value)}
                      className="w-full px-3.5 py-2 pr-10 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Masukkan jika ingin mengganti password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordLama(!showPasswordLama)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordLama ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPasswordBaru ? 'text' : 'password'}
                      value={passwordBaru}
                      onChange={(e) => setPasswordBaru(e.target.value)}
                      className="w-full px-3.5 py-2 pr-10 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Minimal 4 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                {passwordBaru && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Ulangi Password Baru</label>
                    <input
                      type="password"
                      value={konfirmasiPassword}
                      onChange={(e) => setKonfirmasiPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Ketik ulang password baru"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfil}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfil ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Daftar Akun Kasir & Admin</h4>
                  <p className="text-[11px] text-slate-500">Kelola akun yang berhak login ke sistem</p>
                </div>
                {!showAddUser && (
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kasir</span>
                  </button>
                )}
              </div>

              {/* Form Tambah Kasir */}
              {showAddUser && (
                <form onSubmit={handleAddUser} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Form Akun Kasir Baru</span>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama Kasir</label>
                      <input
                        type="text"
                        value={newNama}
                        onChange={(e) => setNewNama(e.target.value)}
                        placeholder="Contoh: Reva"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Username Login</label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Contoh: reva"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Password Default</label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="123456"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Role / Jabatan</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="KASIR">KASIR</option>
                        <option value="ADMIN">ADMIN / OWNER</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={addingUser}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition disabled:opacity-50"
                    >
                      {addingUser ? 'Menyimpan...' : 'Simpan User Baru'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabel / Card List Users */}
              <div className="space-y-2">
                {loadingUsers ? (
                  <div className="py-6 text-center text-xs text-slate-400">Memuat daftar user...</div>
                ) : userList.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Belum ada akun user lain.</div>
                ) : (
                  userList.map((u) => {
                    const isSelf = u.id === user.id;
                    return (
                      <div
                        key={u.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isSelf ? 'bg-sky-50/60 border-sky-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'ADMIN' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800">{u.nama}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-semibold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Username: <strong>{u.username}</strong></span>
                              <span>•</span>
                              <span className="uppercase text-[10px] font-bold text-slate-600">{u.role}</span>
                            </div>
                          </div>
                        </div>

                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus user ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

