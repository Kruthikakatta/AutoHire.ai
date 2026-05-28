import { useState, useEffect } from 'react';
import { jobAPI, applicationAPI, resumeAPI } from '../../utils/api';

export default function Dashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    jobAPI.getJobs().then(r => setJobs(r.data));
    applicationAPI.getStats().then(r => setStats(r.data));
  }, []);

  const handleScanEmails = async () => {
    setScanning(true);
    try {
      const res = await jobAPI.scanEmails();
      setJobs(prev => [...res.data.jobs, ...prev]);
      alert(`Found ${res.data.jobs.length} new jobs!`);
    } catch (e) {
      alert('Email scan failed: ' + e.message);
    }
    setScanning(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <button onClick={handleScanEmails} disabled={scanning}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {scanning ? 'Scanning...' : 'Scan Emails'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[['Total Jobs', stats.total || 0], ['Submitted', stats.submitted || 0], ['Interviews', stats.interviews || 0], ['Offers', stats.offers || 0]].map(([label, val]) => (
          <div key={label} className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold mt-1">{val}</p>
          </div>
        ))}
      </div>

      {/* Job List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-medium">Extracted Jobs</h2></div>
        {jobs.length === 0 ? (
          <p className="p-6 text-gray-400 text-center">No jobs yet. Click "Scan Emails" to start.</p>
        ) : jobs.map(job => (
          <div key={job._id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-sm font-medium text-indigo-600">{job.matchScore}% match</span>
              <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
