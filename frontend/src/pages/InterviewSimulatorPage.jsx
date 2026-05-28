import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Dashboard/Navbar';
import { jobAPI, api } from '../utils/api';

export default function InterviewSimulatorPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [session, setSession] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // MediaRecorder states
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    jobAPI.getJobs().then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
    });
  }, []);

  const handleStartSession = async () => {
    if (!selectedJobId) return alert('Select a target job first.');
    try {
      const res = await api.post(`/interviews/start/${selectedJobId}`);
      setSession(res.data);
      setActiveQuestionIndex(0);
      setEvaluationResult(null);
      await startWebcamFeed();
    } catch (err) {
      alert(`Failed to spawn interview session: ${err.message}`);
    }
  };

  const startWebcamFeed = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(localStream);
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
      }
    } catch (err) {
      console.warn('Webcam feed could not initialize, falling back to audio-only:', err.message);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
      } catch (e) {
        alert('Microphone/Webcam permissions denied. Verification required.');
      }
    }
  };

  const handleStartRecording = () => {
    if (!stream) return alert('Camera/Mic streams are not configured.');
    setRecording(true);
    setMediaBlob(null);
    setEvaluationResult(null);
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
      setMediaBlob(blob);
      setRecording(false);
    };

    recorder.start();
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmitResponse = async () => {
    if (!mediaBlob || !session) return;

    setEvaluating(true);
    setEvaluationResult(null);

    const activeQuestion = session.questions[activeQuestionIndex];
    const formData = new FormData();
    formData.append('media', mediaBlob, 'response.webm');
    formData.append('sessionId', session._id);
    formData.append('questionId', activeQuestion._id);

    try {
      const res = await api.post('/interviews/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEvaluationResult(res.data);
      
      // Update session locally
      const updatedQuestions = [...session.questions];
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        userAnswerText: res.data.userAnswerText,
        similarityScore: res.data.similarityScore,
        confidenceScore: res.data.confidenceScore,
        facialSentiment: res.data.facialSentiment,
        feedback: res.data.feedback
      };
      setSession(prev => ({
        ...prev,
        questions: updatedQuestions,
        overallScore: res.data.overallScore
      }));

    } catch (err) {
      alert(`Speech evaluation failed: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const activeQuestion = session?.questions[activeQuestionIndex];

  return (
    <div className="flex bg-gradient-mesh min-h-screen">
      <Navbar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-100">AI Interview Simulator</h2>
          <p className="text-slate-400 text-sm mt-1">Practice mock interviews structured from scraped JDs, featuring Whisper ASR & facial analytics.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active webcam recorder view */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden relative bg-[#090d16] flex items-center justify-center min-h-[380px]">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[380px]"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-5xl block mb-4">🎥</span>
                  <p className="font-bold text-slate-300">Live Camera Stream Offline</p>
                  <p className="text-slate-500 text-xs mt-1">Select a target job and launch the session to initiate WebRTC streams.</p>
                </div>
              )}

              {/* Recording badge overlay */}
              {recording && (
                <div className="absolute top-4 left-4 bg-rose-600/90 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white block"></span>
                  Recording Response
                </div>
              )}
            </div>

            {/* Recorder controls panel */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex justify-between items-center">
              <div className="flex gap-4">
                {!recording ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={!session || evaluating}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-rose-600/10"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all duration-300"
                  >
                    Stop Recording
                  </button>
                )}

                <button
                  onClick={handleSubmitResponse}
                  disabled={!mediaBlob || evaluating}
                  className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300"
                >
                  {evaluating ? 'Analyzing Media...' : 'Submit Answer'}
                </button>
              </div>

              {/* Session question navigation slider */}
              {session && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveQuestionIndex(prev => Math.max(prev - 1, 0));
                      setEvaluationResult(null);
                      setMediaBlob(null);
                    }}
                    disabled={activeQuestionIndex === 0}
                    className="px-3 py-2 bg-slate-800 rounded-lg text-slate-300 disabled:opacity-50 text-xs"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-400 font-bold">
                    Q{activeQuestionIndex + 1} of {session.questions.length}
                  </span>
                  <button
                    onClick={() => {
                      setActiveQuestionIndex(prev => Math.min(prev + 1, session.questions.length - 1));
                      setEvaluationResult(null);
                      setMediaBlob(null);
                    }}
                    disabled={activeQuestionIndex === session.questions.length - 1}
                    className="px-3 py-2 bg-slate-800 rounded-lg text-slate-300 disabled:opacity-50 text-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Question description card */}
            {session && activeQuestion && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    {activeQuestion.category} question
                  </span>
                  {activeQuestion.userAnswerText && (
                    <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                      Answered
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-slate-200">{activeQuestion.questionText}</h4>
              </div>
            )}
          </div>

          {/* Feedback & Analytics Side */}
          <div className="flex flex-col gap-6">
            {/* Session start dashboard controller */}
            {!session ? (
              <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-md font-bold text-slate-200 mb-4">Start Simulated Interview</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1">Target Scraped Job</label>
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
                  <button
                    onClick={handleStartSession}
                    disabled={!selectedJobId}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all duration-300 shadow-md shadow-indigo-500/10"
                  >
                    Spawn Interview Panel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Aggregate interview score tracking panel */}
                <div className="glass-card p-6 rounded-2xl border border-slate-800/80 text-center">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Session Score</span>
                  <span className="text-5xl font-extrabold text-indigo-400 block mt-2">{session.overallScore || 0}%</span>
                  <p className="text-[10px] text-slate-500 mt-3 font-semibold">Average of semantic alignment and confidence telemetry</p>
                </div>

                {/* Sub-item specific analytics charts */}
                {evaluating ? (
                  <div className="glass-card p-12 rounded-2xl border border-slate-800/80 text-center flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    <p className="font-semibold text-slate-300 text-sm">Evaluating presentation logs...</p>
                  </div>
                ) : evaluationResult ? (
                  <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col gap-6">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Question Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 font-bold block">Vocal Terminology</span>
                        <span className="text-2xl font-extrabold text-cyan-400 block mt-1">{evaluationResult.similarityScore}%</span>
                      </div>
                      <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 font-bold block">Confidence Level</span>
                        <span className="text-2xl font-extrabold text-purple-400 block mt-1">{evaluationResult.confidenceScore}%</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-1">Visual Sentiment</span>
                      <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full uppercase">
                        🎭 {evaluationResult.facialSentiment}
                      </span>
                    </div>

                    <div className="border-t border-slate-800/60 pt-4 flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-300 block">Whisper & OpenCV Feedback:</span>
                      <p className="text-slate-400 text-xs leading-relaxed">{evaluationResult.feedback}</p>
                    </div>

                    <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-1 text-[11px]">
                      <span className="text-slate-500 font-bold block">Whisper ASR Transcript:</span>
                      <p className="text-slate-400 leading-normal italic font-mono">"{evaluationResult.userAnswerText}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-8 rounded-2xl border border-slate-800/80 text-center text-slate-500 text-xs">
                    Record and submit an answer to populate real-time assessment logs.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
