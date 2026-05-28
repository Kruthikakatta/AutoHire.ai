const Job = require('../models/Job');
const { getUnreadEmails, getEmailContent, markAsRead } = require('../services/email/emailScanner');
const { isJobEmail, extractJobDetails } = require('../services/email/jobExtractor');
const { calculateATSScore } = require('../services/ai/atsScorer');
const { classifyJobEmail } = require('../services/ai/nlpService');
const User = require('../models/User');

// Trigger email scan and extract jobs
const scanEmails = async (req, res) => {
  try {
    const emails = await getUnreadEmails(15);
    const jobsFound = [];

    for (const email of emails) {
      const content = await getEmailContent(email.id);
      if (isJobEmail(content.subject, content.body)) {
        const details = extractJobDetails(content.subject, content.body);
        const job = await Job.create({ userId: req.user.id, ...details, source: 'email', emailId: email.id });
        await markAsRead(email.id);
        jobsFound.push(job);
      }
    }

    res.json({ message: `Scanned ${emails.length} emails, found ${jobsFound.length} jobs`, jobs: jobsFound });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  const jobs = await Job.find({ userId: req.user.id }).sort({ extractedAt: -1 });
  res.json(jobs);
};

const getJobById = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, userId: req.user.id });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
};

const deleteJob = async (req, res) => {
  await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Job deleted' });
};

module.exports = { scanEmails, getJobs, getJobById, deleteJob };
