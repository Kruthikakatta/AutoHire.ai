const axios = require('axios');

const HF_API = 'https://api-inference.huggingface.co/models';
const HEADERS = { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` };

// Classify if text is job-related using zero-shot classification
const classifyJobEmail = async (text) => {
  const { data } = await axios.post(`${HF_API}/facebook/bart-large-mnli`, {
    inputs: text.substring(0, 512),
    parameters: { candidate_labels: ['job opportunity', 'newsletter', 'spam', 'personal', 'promotion'] }
  }, { headers: HEADERS });
  return { label: data.labels[0], score: data.scores[0] };
};

// Extract job category
const extractJobCategory = async (jobDescription) => {
  const { data } = await axios.post(`${HF_API}/facebook/bart-large-mnli`, {
    inputs: jobDescription.substring(0, 512),
    parameters: { candidate_labels: ['Software Engineering', 'Data Science', 'Marketing', 'Finance', 'Design', 'Management', 'Sales'] }
  }, { headers: HEADERS });
  return data.labels[0];
};

module.exports = { classifyJobEmail, extractJobCategory };
