const Resume = require('../models/Resume');
const User = require('../models/User');
const Job = require('../models/Job');
const { parseResume } = require('../services/resume/resumeParser');
const { runOptimizationPipeline } = require('../services/resume/resumeOptimizer');

const uploadResume = async (req, res) => {
  try {
    const parsed = await parseResume(req.file.path);
    await User.findByIdAndUpdate(req.user.id, { resumeUrl: req.file.path });
    res.json({ message: 'Resume uploaded and parsed', text: parsed.rawText, sections: parsed.sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const optimizeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const job = await Job.findById(req.params.jobId);
    if (!user.resumeUrl) return res.status(400).json({ message: 'No resume uploaded yet' });
    const parsed = await parseResume(user.resumeUrl);
    const result = await runOptimizationPipeline(req.user.id, parsed.rawText, job);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeHistory = async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(resumes);
};

module.exports = { uploadResume, optimizeResume, getResumeHistory };
