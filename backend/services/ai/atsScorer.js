// ATS Score Calculator - matches resume keywords against job description
const calculateATSScore = (resumeText, jobDescription) => {
  const resume = resumeText.toLowerCase();
  const jd = jobDescription.toLowerCase();

  // Extract keywords from JD
  const jdWords = jd.match(/\b[a-z]{4,}\b/g) || [];
  const jdKeywords = [...new Set(jdWords)].filter(w => !STOP_WORDS.includes(w));

  // Count matches
  const matched = jdKeywords.filter(kw => resume.includes(kw));
  const score = Math.round((matched.length / jdKeywords.length) * 100);

  return {
    score: Math.min(score, 100),
    matchedKeywords: matched.slice(0, 20),
    missingKeywords: jdKeywords.filter(kw => !resume.includes(kw)).slice(0, 20),
    totalJdKeywords: jdKeywords.length
  };
};

const STOP_WORDS = ['the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'from', 'they', 'your', 'what', 'about', 'which', 'when', 'make', 'like', 'into', 'more', 'also', 'been', 'some'];

module.exports = { calculateATSScore };
