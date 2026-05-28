const { optimizeResume, generateCoverLetter } = require('../ai/gptService');
const { calculateATSScore } = require('../ai/atsScorer');
const Resume = require('../../models/Resume');

// Full optimization pipeline: score → optimize → rescore
const runOptimizationPipeline = async (userId, resumeText, job) => {
  // Step 1: Score original resume
  const beforeScore = calculateATSScore(resumeText, job.description);

  // Step 2: Optimize with GPT-4
  const optimizedText = await optimizeResume(resumeText, job.description);

  // Step 3: Score optimized resume
  const afterScore = calculateATSScore(optimizedText, job.description);

  // Step 4: Generate cover letter
  const coverLetter = await generateCoverLetter(resumeText, job.description, job.company, job.title);

  // Step 5: Save to DB
  const resumeRecord = await Resume.create({
    userId, jobId: job._id,
    originalText: resumeText,
    optimizedText,
    keywords: afterScore.matchedKeywords,
    atsScore: afterScore.score
  });

  return {
    resumeId: resumeRecord._id,
    optimizedText,
    coverLetter,
    scoreImprovement: { before: beforeScore.score, after: afterScore.score },
    addedKeywords: afterScore.matchedKeywords.filter(k => !beforeScore.matchedKeywords.includes(k))
  };
};

module.exports = { runOptimizationPipeline };
