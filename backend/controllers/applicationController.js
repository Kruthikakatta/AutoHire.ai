const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { submitApplication } = require('../services/apply/autoApply');
const User = require('../models/User');

const getApplications = async (req, res) => {
  const apps = await Application.find({ userId: req.user.id }).populate('jobId').sort({ createdAt: -1 });
  res.json(apps);
};

const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    const user = await User.findById(req.user.id);
    const latestResume = await Resume.findOne({ userId: req.user.id, jobId: job._id }).sort({ createdAt: -1 });
    const result = await submitApplication(req.user.id, job, user.resumeUrl, latestResume?.optimizedText || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  const apps = await Application.find({ userId: req.user.id });
  const stats = {
    total: apps.length,
    submitted: apps.filter(a => a.status === 'submitted').length,
    interviews: apps.filter(a => a.status === 'interview').length,
    offers: apps.filter(a => a.status === 'offer').length,
    failed: apps.filter(a => a.status === 'failed').length
  };
  res.json(stats);
};

module.exports = { getApplications, applyToJob, getStats };
