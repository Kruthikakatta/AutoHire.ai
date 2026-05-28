// NOTE: This service requires selenium-webdriver installed separately
// npm install selenium-webdriver chromedriver

const Application = require('../../models/Application');

// Main auto-apply function - entry point
const submitApplication = async (userId, job, optimizedResumePath, coverLetterText) => {
  const application = await Application.create({
    userId, jobId: job._id, status: 'pending'
  });

  try {
    // Detect which portal the job is from
    const portal = detectPortal(job.applyLink);

    let result;
    if (portal === 'email') {
      result = await applyViaEmail(job, optimizedResumePath, coverLetterText);
    } else {
      // For web portals - use Selenium (requires separate setup)
      result = await applyViaWebForm(job, optimizedResumePath, coverLetterText);
    }

    await Application.findByIdAndUpdate(application._id, {
      status: 'submitted', appliedAt: new Date()
    });

    return { success: true, applicationId: application._id };
  } catch (error) {
    await Application.findByIdAndUpdate(application._id, {
      status: 'failed', errorLog: error.message
    });
    return { success: false, error: error.message };
  }
};

const detectPortal = (url) => {
  if (!url) return 'email';
  if (url.includes('linkedin')) return 'linkedin';
  if (url.includes('indeed')) return 'indeed';
  if (url.includes('glassdoor')) return 'glassdoor';
  if (url.includes('naukri')) return 'naukri';
  return 'generic';
};

const applyViaEmail = async (job, resumePath, coverLetter) => {
  // TODO: Use nodemailer to send application email
  console.log(`Applying via email for: ${job.title} at ${job.company}`);
  return { method: 'email' };
};

const applyViaWebForm = async (job, resumePath, coverLetter) => {
  // TODO: Implement Selenium automation per portal
  // See scripts/selenium/ folder for portal-specific scripts
  console.log(`Web form apply for: ${job.applyLink}`);
  return { method: 'webform' };
};

module.exports = { submitApplication };
