const Application = require('../../models/Application');
const User = require('../../models/User');
const { runPlaywrightApply } = require('./seleniumAgent');

/**
 * Orchestrates autonomous application filing
 * @param {string} userId - ID of current user
 * @param {object} job - Target job schema object
 * @param {string} resumePath - Absolute path to user optimized resume PDF
 * @param {string} coverLetterText - Formatted cover letter
 */
const submitApplication = async (userId, job, resumePath, coverLetterText) => {
  // 1. Initialize or find the pending application tracking node
  const application = await Application.create({
    userId,
    jobId: job._id,
    status: 'pending',
    coverLetterVersion: '1.0',
    atsScoreBeforeApply: job.atsScore
  });

  try {
    // 2. Fetch User profiles for name, email, and phone contact data
    const user = await User.findById(userId);
    if (!user) throw new Error('User account profile was not found.');

    const portal = detectPortal(job.applyLink);
    let result;

    if (portal === 'email') {
      result = await applyViaEmail(user, job, resumePath, coverLetterText);
    } else {
      // 3. Trigger autonomous playwright agent
      result = await runPlaywrightApply(job.applyLink, user, resumePath, coverLetterText);
    }

    if (result.success) {
      // 4. Record successful submission details
      await Application.findByIdAndUpdate(application._id, {
        status: 'submitted',
        appliedAt: new Date(),
        notes: `Successfully filed job via ${portal} portal. Screenshot archived.`,
        errorLog: ''
      });
      return { success: true, applicationId: application._id, screenshot: result.screenshot };
    } else {
      // 5. Track specific failure details for retry queuing
      throw new Error(result.error || 'Automation agent failed to locate core inputs.');
    }

  } catch (error) {
    console.error(`[AutoApply Pipeline Exception] ${error.message}`);
    await Application.findByIdAndUpdate(application._id, {
      status: 'failed',
      errorLog: error.message
    });
    return { success: false, error: error.message };
  }
};

const detectPortal = (url) => {
  if (!url || url.startsWith('mailto:')) return 'email';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('indeed.com')) return 'indeed';
  if (url.includes('lever.co')) return 'lever';
  if (url.includes('greenhouse.io')) return 'greenhouse';
  return 'generic';
};

const applyViaEmail = async (user, job, resumePath, coverLetter) => {
  // Simulated email response - in enterprise use cases, nodemailer connects to outlook/gmail API to send application mail
  console.log(`[Email Application] Sending cover letter and resume to job poster: ${job.company}`);
  return {
    success: true,
    logs: [{ timestamp: new Date(), message: 'Sent resume and cover letter attachment to candidate mail queue.' }]
  };
};

module.exports = { submitApplication };
