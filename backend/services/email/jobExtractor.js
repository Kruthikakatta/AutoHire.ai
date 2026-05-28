const axios = require('axios');
const cheerio = require('cheerio');

// Keywords that indicate a job-related email
const JOB_KEYWORDS = ['hiring', 'job opening', 'vacancy', 'apply now', 'position', 'opportunity', 'recruiter', 'career', 'role', 'we are looking'];

// Check if email is job-related
const isJobEmail = (subject, body) => {
  const text = (subject + ' ' + body).toLowerCase();
  return JOB_KEYWORDS.some(kw => text.includes(kw));
};

// Extract job details using regex
const extractJobDetails = (subject, body) => {
  const text = subject + '\n' + body;
  return {
    title: text.match(/(?:hiring for|looking for|position[:\s]+|role[:\s]+)(.+?)(?:\n|at |in )/i)?.[1]?.trim() || subject,
    company: text.match(/(?:at |@\s*)([A-Z][a-zA-Z\s]+)(?:\s*[-|,])/)?.[1]?.trim() || 'Unknown',
    skills: extractSkills(text),
    deadline: text.match(/(?:apply by|deadline[:\s]+|last date[:\s]+)(.+?)(?:\n|$)/i)?.[1]?.trim() || null,
    applyLink: text.match(/https?:\/\/[^\s]+(?:apply|job|career)[^\s]*/i)?.[0] || null,
    location: text.match(/(?:location[:\s]+|based in )(.+?)(?:\n|,|$)/i)?.[1]?.trim() || 'Remote/Not specified'
  };
};

// Extract skills from text
const extractSkills = (text) => {
  const KNOWN_SKILLS = ['python', 'javascript', 'react', 'node.js', 'java', 'sql', 'mongodb', 'aws', 'docker', 'machine learning', 'nlp', 'tensorflow', 'pytorch'];
  return KNOWN_SKILLS.filter(skill => text.toLowerCase().includes(skill));
};

// Scrape job description from external link
const scrapeJobLink = async (url) => {
  try {
    const { data } = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    $('script, style, nav, footer').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000);
  } catch {
    return null;
  }
};

module.exports = { isJobEmail, extractJobDetails, scrapeJobLink };
