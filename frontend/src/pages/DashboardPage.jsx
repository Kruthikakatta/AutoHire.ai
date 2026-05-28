import useAuth from '../hooks/useAuth';
import Dashboard from '../components/Dashboard/Dashboard';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <span className="font-semibold">AutoHire.AI</span>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">Logout</button>
      </nav>
      <Dashboard user={user} />
    </div>
  );
}
