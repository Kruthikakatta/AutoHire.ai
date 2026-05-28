// Clean and truncate text for AI API calls (saves tokens)
const truncateText = (text, maxChars = 3000) => text?.slice(0, maxChars).trim() || '';

// Format a job object for display
const formatJob = (job) => ({
  id: job._id,
  title: job.title,
  company: job.company,
  matchScore: `${job.matchScore}%`,
  status: job.status,
  extractedAt: new Date(job.extractedAt).toLocaleDateString()
});

// Delay utility for rate limiting API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for unstable operations (like Selenium)
const withRetry = async (fn, retries = 3, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs);
    }
  }
};

module.exports = { truncateText, formatJob, delay, withRetry };
