import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b">
        <span className="font-semibold text-lg">AutoHire.AI</span>
        <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
          Get Started
        </button>
      </nav>
      <div className="max-w-3xl mx-auto text-center py-24 px-6">
        <h1 className="text-5xl font-semibold mb-4">Apply to jobs while you sleep.</h1>
        <p className="text-xl text-gray-500 mb-8">AutoHire.AI reads your emails, rewrites your resume, and submits applications — fully automatically.</p>
        <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-indigo-700">
          Start Free Trial
        </button>
      </div>
    </div>
  );
}
