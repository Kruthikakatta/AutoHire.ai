const { gmail } = require('../../config/gmail');

// Fetch latest unread emails from Gmail
const getUnreadEmails = async (maxResults = 15) => {
  const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults });
  return res.data.messages || [];
};

// Get full email content by ID
const getEmailContent = async (messageId) => {
  const res = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  const payload = res.data.payload;
  let body = '';

  if (payload.parts) {
    payload.parts.forEach(part => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    });
  } else if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  return {
    id: messageId,
    subject: payload.headers.find(h => h.name === 'Subject')?.value || '',
    from: payload.headers.find(h => h.name === 'From')?.value || '',
    body,
    snippet: res.data.snippet
  };
};

// Mark email as read after processing
const markAsRead = async (messageId) => {
  await gmail.users.messages.modify({
    userId: 'me', id: messageId,
    resource: { removeLabelIds: ['UNREAD'] }
  });
};

module.exports = { getUnreadEmails, getEmailContent, markAsRead };
