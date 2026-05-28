import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Resume Optimizer', path: '/optimize', icon: '📝' },
    { name: 'Interview Sim', path: '/interviews', icon: '🎙️' },
    { name: 'Research Hub', path: '/research', icon: '🔬' }
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between p-6">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AutoHire.AI
            </h1>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">Enterprise</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session card & Logout action */}
      <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="User Avatar" className="w-10 h-10 rounded-full border border-indigo-500/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-slate-100 uppercase border border-indigo-400/20">
                {user.name[0]}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.plan || 'Free'} Plan</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-800 hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all duration-300 font-medium"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
