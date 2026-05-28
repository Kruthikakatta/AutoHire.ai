import React, { useState, useEffect } from 'react';
import Navbar from '../components/Dashboard/Navbar';
import { jobAPI, resumeAPI, applicationAPI } from '../utils/api';

export default function ResumeOptimizerPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [applying, setApplying] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [applyResult, setApplyResult] = useState(null);

  useEffect(() => {
    jobAPI.getJobs().then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
    });
  }, []);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert('Select a file to parse first.');

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await resumeAPI.upload(formData);
      alert('Resume successfully parsed and raw text structured in DB!');
    } catch (err) {
      alert(`Parse failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleOptimizePipeline = async () => {
    if (!selectedJobId) return alert('Please select a target job opening first.');

    setOptimizing(true);
    setOptimizationResult(null);
    setApplyResult(null);

    try {
      const res = await resumeAPI.optimize(selectedJobId);
      setOptimizationResult(res.data);
    } catch (err) {
      alert(`Optimization pipeline failed: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleAutonomousApply = async () => {
    if (!selectedJobId) return;

    setApplying(true);
    setApplyResult(null);

    try {
      const res = await applicationAPI.apply(selectedJobId);
      setApplyResult(res.data);
      if (res.data.success) {
        alert('Automation run success! Application submitted to job board.');
      } else {
        alert(`Application submission failed: ${res.data.error}`);
      }
    } catch (err) {
      alert(`Autonomous apply failed: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  const activeJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div className="flex bg-gradient-mesh min-h-screen">
      <Navbar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-100">AI Resume Optimizer</h2>
          <p className="text-slate-400 text-sm mt-1">Optimize ATS alignment scoring, inject keywords, and file applications autonomously.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side Controls */}
          <div className="flex flex-col gap-6">
            {/* Step 1: Upload Resume */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
              <h3 className="text-md font-bold text-indigo-400 mb-4 uppercase tracking-wider">Step 1: Upload CV</h3>
              <form onSubmit={handleUploadResume} className="flex flex-col gap-4">
                <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/35 rounded-xl p-6 text-center cursor-pointer block transition-colors duration-300">
                  <span className="text-3xl block mb-2">📁</span>
                  <span className="text-xs text-slate-400 font-semibold block truncate">
                    {resumeFile ? resumeFile.name : 'Upload PDF or Word file'}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
                <button
                  type="submit"
                  disabled={uploading || !resumeFile}
                  className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700/60 rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
                >
                  {uploading ? 'Parsing File...' : 'Parse Resume'}
                </button>
              </form>
            </div>

            {/* Step 2: Target Position Select */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
              <h3 className="text-md font-bold text-indigo-400 mb-4 uppercase tracking-wider">Step 2: Select Job</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">Scraped Opportunities</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-800 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
                  >
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.company} - {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                {activeJob && (
                  <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 text-xs flex flex-col gap-2">
                    <p className="font-bold text-slate-300">{activeJob.title}</p>
                    <p className="text-slate-500">{activeJob.company} • 📍 {activeJob.location}</p>
                    <p className="text-slate-400 truncate mt-2">{activeJob.description}</p>
                  </div>
                )}

                <button
                  onClick={handleOptimizePipeline}
                  disabled={optimizing || !selectedJobId}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 shadow-md shadow-indigo-500/10"
                >
                  {optimizing ? 'Running AI Optimization...' : 'Optimize Resume'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Comparison Side */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!optimizationResult ? (
              <div className="glass-card rounded-2xl border border-slate-800/80 p-12 text-center flex-1 flex flex-col items-center justify-center min-h-[400px]">
                {optimizing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    <p className="font-semibold text-slate-300">Evaluating Semantic Spacing...</p>
                    <p className="text-xs text-slate-500">Injecting keywords dynamically and generating cover letter</p>
                  </div>
                ) : (
                  <>
                    <span className="text-5xl block mb-4">🚀</span>
                    <p className="font-bold text-slate-300">Optimization Result Pipeline Idle</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                      Parse a resume and select a targeted job opportunity from the left controls to begin.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Scoring improvement delta card */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Initial Score</span>
                    <span className="text-3xl font-extrabold text-rose-400 block mt-1">
                      {optimizationResult.scoreImprovement.before}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">ATS Optimized</span>
                    <span className="text-3xl font-extrabold text-emerald-400 block mt-1">
                      {optimizationResult.scoreImprovement.after}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Keyword Gain</span>
                    <span className="text-3xl font-extrabold text-indigo-400 block mt-1">
                      +{optimizationResult.addedKeywords.length}
                    </span>
                  </div>
                </div>

                {/* Side-by-side preview panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Optimized Resume Text */}
                  <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col h-[350px]">
                    <div className="p-4 bg-slate-900/60 border-b border-slate-800/60 flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-300">Optimized Resume Text</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">GPT-4 Formatted</span>
                    </div>
                    <div className="p-4 overflow-y-auto text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap flex-1">
                      {optimizationResult.optimizedText}
                    </div>
                  </div>

                  {/* Generated Tailored Cover Letter */}
                  <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col h-[350px]">
                    <div className="p-4 bg-slate-900/60 border-b border-slate-800/60 flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-300">Tailored Cover Letter</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">STAR Standard</span>
                    </div>
                    <div className="p-4 overflow-y-auto text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap flex-1">
                      {optimizationResult.coverLetter}
                    </div>
                  </div>
                </div>

                {/* Automation Actions */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-200">Step 3: Autonomous RPA Submission</h4>
                      <p className="text-xs text-slate-500 mt-1">Initiates Playwright headless process to solve forms and upload assets.</p>
                    </div>

                    <button
                      onClick={handleAutonomousApply}
                      disabled={applying}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-extrabold shadow-lg shadow-emerald-500/10 transition-all duration-300 disabled:opacity-50"
                    >
                      {applying ? 'Launching Browser Loop...' : 'Trigger Headless Apply'}
                    </button>
                  </div>

                  {/* Browser results logs terminal output */}
                  {applying && (
                    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 mt-4 font-mono text-[10px] text-cyan-400 leading-relaxed h-32 overflow-y-auto flex flex-col gap-1">
                      <p className="text-slate-400 animate-pulse">[RPA Agent] Navigating context to job board...</p>
                      <p className="text-slate-500">[RPA Agent] Loading anti-bot residential proxy rotation</p>
                    </div>
                  )}

                  {applyResult && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mt-4 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-200">Submission Result Status:</p>
                        <p className="text-slate-400 mt-1">{applyResult.success ? '✓ Successfully submitted. Telemetry logged.' : `✕ Failure logged: ${applyResult.error}`}</p>
                      </div>
                      {applyResult.screenshot && (
                        <div className="text-xs text-indigo-400 font-bold border-b border-indigo-500 cursor-pointer">
                          View Screenshot
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
