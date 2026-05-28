// Quick test script to verify Gmail API connection
require('dotenv').config({ path: '../.env' });
const { getUnreadEmails, getEmailContent } = require('../backend/services/email/emailScanner');
const { isJobEmail, extractJobDetails } = require('../backend/services/email/jobExtractor');

(async () => {
  console.log('Testing Gmail connection...');
  const emails = await getUnreadEmails(5);
  console.log(`Found ${emails.length} unread emails`);
  for (const email of emails) {
    const content = await getEmailContent(email.id);
    const isJob = isJobEmail(content.subject, content.body);
    console.log(`[${isJob ? 'JOB' : 'skip'}] ${content.subject}`);
    if (isJob) console.log('  Details:', extractJobDetails(content.subject, content.body));
  }
})();
