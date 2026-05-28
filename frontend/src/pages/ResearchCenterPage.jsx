import React, { useState, useEffect } from 'react';
import Navbar from '../components/Dashboard/Navbar';
import { jobAPI, resumeAPI, api } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ResearchCenterPage() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  useEffect(() => {
    jobAPI.getJobs().then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
    });
    resumeAPI.getHistory().then(res => {
      setResumes(res.data);
      if (res.data.length > 0) setSelectedResumeId(res.data[0]._id);
    });
  }, []);

  const handleRunBenchmark = async () => {
    if (!selectedJobId || !selectedResumeId) {
      return alert('Verify that both a resume file and target job opening have been selected.');
    }

    setBenchmarking(true);
    setBenchmarkResult(null);

    try {
      const res = await api.post('/research/benchmark', {
        resumeId: selectedResumeId,
        jobId: selectedJobId
      });
      setBenchmarkResult(res.data);
    } catch (err) {
      alert(`Benchmark execution failed: ${err.message}`);
    } finally {
      setBenchmarking(false);
    }
  };

  return (
    <div className="flex bg-gradient-mesh min-h-screen">
      <Navbar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-100">Research & Experimentation Center</h2>
          <p className="text-slate-400 text-sm mt-1">
            Academic benchmarking panel mapping vector similarities, NER efficiency ratios, and publication abstract frameworks.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Side card */}
          <div className="flex flex-col gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
              <h3 className="text-md font-bold text-slate-200 mb-4 uppercase tracking-wider">Configure Benchmarks</h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">Target Resume Version</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-800 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {resumes.length === 0 ? (
                      <option value="">No optimized resumes in DB</option>
                    ) : resumes.map(res => (
                      <option key={res._id} value={res._id}>
                        v{res.version} - score: {res.atsScore || 0}% ({res.createdAt.substring(0, 10)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1">Job Context Vector</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-800 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>
                        {job.company} - {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunBenchmark}
                  disabled={benchmarking || !selectedJobId || !selectedResumeId}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 shadow-md shadow-purple-500/10 text-xs"
                >
                  {benchmarking ? 'Running NLP Calculations...' : 'Execute Semantic Benchmarking'}
                </button>
              </div>
            </div>

            {/* Publication abstract generation box */}
            {benchmarkResult && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-indigo-950/10">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">IEEE/Springer Ready Abstract</h4>
                <p className="text-xs text-slate-400 leading-relaxed italic font-serif">
                  "{benchmarkResult.publicationReadyAbstract}"
                </p>
              </div>
            )}
          </div>

          {/* Academic Charts Dashboard Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {!benchmarkResult ? (
              <div className="glass-card rounded-2xl border border-slate-800/80 p-12 text-center flex-1 flex flex-col items-center justify-center min-h-[400px]">
                {benchmarking ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                    <p className="font-semibold text-slate-300 text-sm">Evaluating Token Vector Space...</p>
                    <p className="text-xs text-slate-500">Calculating Jaccard overlaps and projecting DistilBERT scores</p>
                  </div>
                ) : (
                  <>
                    <span className="text-5xl block mb-4">🔬</span>
                    <p className="font-bold text-slate-300">Benchmarks Ready for Execution</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                      Select target CV and job vectors, then run the evaluation panel to compile comparative diagrams.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-pulse-slow">
                {/* 1. Bar chart comparing similarity model metrics */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-200 mb-6 uppercase tracking-wider">Semantic Retrieval Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={benchmarkResult.modelEvaluation}>
                        <XAxis dataKey="model" stroke="#4b5563" fontSize={10} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111827', borderColor: '#374151', color: '#f3f4f6' }} />
                        <Bar dataKey="similarityScore" fill="#6366f1" radius={[4, 4, 0, 0]} name="Similarity %" />
                        <Bar dataKey="f1Score" fill="#a855f7" radius={[4, 4, 0, 0]} name="F1-Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Comparative grid showing details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar model dimensions chart */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-80">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Model Precision/Recall Space</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={benchmarkResult.modelEvaluation}>
                          <PolarGrid stroke="#1f2937" />
                          <PolarAngleAxis dataKey="model" stroke="#9ca3af" fontSize={8} />
                          <PolarRadiusAxis stroke="#4b5563" fontSize={8} />
                          <Radar name="Precision" dataKey="precision" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                          <Radar name="Recall" dataKey="recall" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* NER Entity Mismatch Summary card */}
                  <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-80">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">NER Entity Mismatch Analysis</h4>
                      <p className="text-[11px] text-slate-400 leading-normal mb-4">
                        Comparing entities captured by classical Regular Expression (Regex) libraries vs transformer-based spacy NER engines.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-center my-2">
                        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-3">
                          <span className="text-[9px] text-slate-500 font-extrabold block">REGEX ENTITIES</span>
                          <span className="text-2xl font-extrabold text-slate-400 block mt-1">{benchmarkResult.entityBenchmarks.regexCount}</span>
                        </div>
                        <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-3">
                          <span className="text-[9px] text-slate-500 font-extrabold block">SPACY ENTITIES</span>
                          <span className="text-2xl font-extrabold text-indigo-400 block mt-1">{benchmarkResult.entityBenchmarks.spacyCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/60 pt-4 text-[10px]">
                      <span className="text-slate-500 font-bold block mb-1">Entities missed by Regex (Captured via spaCy NER):</span>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {benchmarkResult.entityBenchmarks.missedByRegex.map((ent, i) => (
                          <span key={i} className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
