const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optimize resume for a specific job description
const optimizeResume = async (resumeText, jobDescription) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume writer and ATS optimization specialist. Rewrite resumes to maximize ATS scores while keeping them honest and professional.'
      },
      {
        role: 'user',
        content: `Optimize this resume for the job description below. Inject relevant keywords naturally, improve formatting, and boost ATS score.
        
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return only the optimized resume text.`
      }
    ],
    max_tokens: 1500,
    temperature: 0.3
  });
  return response.choices[0].message.content;
};

// Generate a tailored cover letter
const generateCoverLetter = async (resumeText, jobDescription, company, role) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert cover letter writer. Write concise, compelling, personalized cover letters that get interviews.'
      },
      {
        role: 'user',
        content: `Write a professional cover letter for this job.

ROLE: ${role} at ${company}
JOB DESCRIPTION: ${jobDescription}
MY RESUME: ${resumeText}

Write a 3-paragraph cover letter. Be specific, not generic.`
      }
    ],
    max_tokens: 600,
    temperature: 0.5
  });
  return response.choices[0].message.content;
};

// Generate mock interview questions from JD
const generateInterviewQuestions = async (jobDescription, role) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Generate 5 technical and 3 behavioral interview questions for this role.
ROLE: ${role}
JOB DESCRIPTION: ${jobDescription}
Return as JSON: { technical: [...], behavioral: [...] }`
      }
    ],
    max_tokens: 500,
    temperature: 0.6
  });
  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return { technical: [], behavioral: [] };
  }
};

module.exports = { optimizeResume, generateCoverLetter, generateInterviewQuestions };
