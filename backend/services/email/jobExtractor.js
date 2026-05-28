const axios = require('axios');
const cheerio = require('cheerio');

// Massive dictionary of enterprise and tech skills for token-based matching
const TECH_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'node.js',
  'express', 'nest.js', 'fastapi', 'django', 'flask', 'ruby on rails', 'laravel', 'spring boot', 'go',
  'rust', 'c++', 'c#', 'java', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'cassandra', 'dynamodb', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
  'github actions', 'circleci', 'machine learning', 'deep learning', 'nlp', 'natural language processing',
  'computer vision', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'spark', 'hadoop',
  'graphql', 'apollo', 'redux', 'mobx', 'tailwind css', 'bootstrap', 'material ui', 'webpack', 'vite',
  'selenium', 'cypress', 'playwright', 'puppeteer', 'jest', 'mocha', 'chai', 'git', 'ci/cd', 'agile', 'scrum',
  'jira', 'confluence', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'tableau', 'power bi'
];

// Keywords indicating job email
const JOB_KEYWORDS = [
  'hiring', 'job opening', 'vacancy', 'apply now', 'position', 'opportunity',
  'recruiter', 'career', 'role', 'we are looking', 'job description', 'employment'
];

// High-fidelity fallback heuristic check
const isJobEmail = (subject, body) => {
  const text = (subject + ' ' + body).toLowerCase();
  // Count matches to enforce confidence threshold
  const matchCount = JOB_KEYWORDS.filter(kw => text.includes(kw)).length;
  return matchCount >= 2;
};

// Advanced parsing using customized heuristics (representing structured spaCy NER outputs)
const extractJobDetails = (subject, body) => {
  const fullText = subject + '\n' + body;
  
  // 1. Extract job title (looks for common surrounding context)
  const titleRegexes = [
    /(?:hiring for|looking for|position(?: of)?|role(?: of)?|open position for)[:\s]+([A-Z][a-zA-Z\s#.+]{2,40})(?:\n|at |in |for |with |$)/i,
    /job opportunity[:\s]+([A-Z][a-zA-Z\s#.+]{2,40})/i,
    /^([A-Z][a-zA-Z\s#.+]{2,40})\b.*(?:hiring|opportunity|role)/i
  ];
  
  let title = '';
  for (const r of titleRegexes) {
    const match = fullText.match(r);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }
  if (!title) title = subject.replace(/hiring|job|opening|position|role/gi, '').trim() || subject;

  // 2. Extract Company name (captures camel case or proper nouns following "at" / "with" / "hiring by")
  const companyRegexes = [
    /(?:at|with|hiring by|join)\s+([A-Z][a-zA-Z0-9\s.]{2,30})(?:\s+in|\s+for|\s+to|\s+is|\s*[-|,|\n])/i,
    /([A-Z][a-zA-Z0-9\s.]{2,30})\s+(?:is looking for|is hiring|announces)/
  ];
  
  let company = 'Unknown';
  for (const r of companyRegexes) {
    const match = fullText.match(r);
    if (match && match[1] && !['the', 'our', 'a', 'this', 'we'].includes(match[1].toLowerCase().trim())) {
      company = match[1].trim();
      break;
    }
  }

  // 3. Extract Salary information
  const salaryRegex = /(?:salary|compensation|package|stipend|remuneration)[:\s]*([$|₹|£|€]?\s*\d+(?:,\d+)*(?:\s*k|\s*m)?(?:\s*-\s*[$|₹|£|€]?\s*\d+(?:,\d+)*(?:\s*k|\s*m)?)?(?:\s*(?:per annum|p\.a\.|per year|\/yr|\/hr|\/month|\/mo))?)/i;
  const salaryMatch = fullText.match(salaryRegex);
  const salary = salaryMatch ? salaryMatch[1].trim() : 'Competitive';

  // 4. Extract Application Deadline
  const deadlineRegexes = [
    /(?:apply by|deadline|last date to apply|expiry)[:\s]*([a-zA-Z]+\s+\d{1,2}(?:\s*,\s*\d{4})?|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /(?:before|by)[:\s]*([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/
  ];
  
  let deadline = null;
  for (const r of deadlineRegexes) {
    const match = fullText.match(r);
    if (match && match[1]) {
      const parsed = Date.parse(match[1]);
      if (!isNaN(parsed)) {
        deadline = new Date(parsed);
        break;
      }
    }
  }

  // 5. Extract Apply Links
  const applyLinkRegex = /(https?:\/\/[^\s"'<>\(\)]*(?:apply|job|career|submit|form)[^\s"'<>\(\)]*)/i;
  const applyLink = fullText.match(applyLinkRegex)?.[0] || null;

  // 6. Extract Location
  const locationRegex = /(?:location|based in|workplace|office|job location)[:\s]*([A-Za-z\s,]{2,40})(?:\n|salary|experience|$)/i;
  const locationMatch = fullText.match(locationRegex);
  const location = locationMatch ? locationMatch[1].trim() : 'Remote/Not specified';

  // 7. Extract Skills
  const skills = extractSkills(fullText);

  return {
    title,
    company,
    skills,
    salary,
    deadline,
    applyLink,
    location
  };
};

// Extracted skills using word-boundary mapping on technical lexicon
const extractSkills = (text) => {
  const lowercaseText = text.toLowerCase();
  return TECH_SKILLS.filter(skill => {
    // Escape regex characters for skill names (like c++)
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lowercaseText);
  });
};

// High-performance external parser scraping via Cheerio
const scrapeJobLink = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    const $ = cheerio.load(data);
    
    // Remove unwanted script & styling blocks
    $('script, style, nav, footer, header, iframe, noscript').remove();
    
    const bodyText = $('body').text();
    // Normalize spaces and extract top 3000 chars
    return bodyText.replace(/\s+/g, ' ').trim().substring(0, 3500);
  } catch (error) {
    console.error(`Scrape failed for ${url}: ${error.message}`);
    return null;
  }
};

module.exports = { isJobEmail, extractJobDetails, extractSkills, scrapeJobLink };
