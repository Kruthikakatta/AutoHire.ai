const InterviewSession = require('../models/InterviewSession');
const Job = require('../models/Job');
const { generateInterviewQuestions } = require('../services/ai/gptService');
const { transcribeAndEvaluateSpeech } = require('../services/ai/whisperService');
const { analyzeFacialExpression } = require('../services/ai/facialAnalysisService');
const fs = require('fs');

// Start new simulated interview session
const startInterviewSession = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, userId: req.user.id });
    if (!job) return res.status(404).json({ message: 'Target job description not found.' });

    // Generate standard behavioral + technical questions from GPT-4
    const aiQuestions = await generateInterviewQuestions(job.description, job.title);

    const questionsList = [];
    
    // Map AI questions into MongoDB subdocument arrays
    const tech = aiQuestions.technical || ['Explain your architectural experience in high-concurrency systems.'];
    const behavioral = aiQuestions.behavioral || ['Tell me about a time you resolved a major bug under tight production deadlines.'];

    tech.forEach(q => {
      questionsList.push({
        questionText: q,
        category: 'technical',
        modelAnswer: 'A high-fidelity answer focuses on system decoupling, horizontal scaling, database shard strategies, and asynchronous queues.'
      });
    });

    behavioral.forEach(q => {
      questionsList.push({
        questionText: q,
        category: 'behavioral',
        modelAnswer: 'A high-fidelity response utilizes the STAR methodology: stating the Situation, Task, Action taken, and Results quantified.'
      });
    });

    const session = await InterviewSession.create({
      userId: req.user.id,
      jobId,
      questions: questionsList
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process recorded audio-video stream file response
const submitQuestionResponse = async (req, res) => {
  try {
    const { sessionId, questionId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No media file upload detected.' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) return res.status(404).json({ message: 'Interview session was not found.' });

    const questionSub = session.questions.id(questionId);
    if (!questionSub) return res.status(404).json({ message: 'Question not found in this session.' });

    const audioFilePath = req.file.path;

    // 1. Transcribe voice and evaluate semantic alignment with model solution
    const speechVal = await transcribeAndEvaluateSpeech(audioFilePath, questionSub.modelAnswer);

    // 2. Perform facial confidence and posture evaluation
    const facialVal = await analyzeFacialExpression(audioFilePath);

    // Clean up temporary uploaded file from disk after evaluation
    try {
      fs.unlinkSync(audioFilePath);
    } catch (e) {
      console.log('Error deleting temp media chunk:', e.message);
    }

    // 3. Update question subdocument telemetry details
    questionSub.userAnswerText = speechVal.transcript;
    questionSub.similarityScore = speechVal.similarityScore;
    questionSub.facialSentiment = facialVal.facialSentiment;
    questionSub.confidenceScore = facialVal.confidenceScore;
    questionSub.feedback = `${speechVal.feedback} ${facialVal.feedback}`;

    // 4. Compute aggregate overall score based on processed items
    const processed = session.questions.filter(q => q.userAnswerText);
    const totalSim = processed.reduce((acc, curr) => acc + curr.similarityScore, 0);
    const totalConf = processed.reduce((acc, curr) => acc + curr.confidenceScore, 0);
    
    const count = processed.length || 1;
    session.overallScore = Math.round((totalSim + totalConf) / (2 * count));

    await session.save();

    res.json({
      questionId,
      userAnswerText: speechVal.transcript,
      similarityScore: speechVal.similarityScore,
      facialSentiment: facialVal.facialSentiment,
      confidenceScore: facialVal.confidenceScore,
      feedback: questionSub.feedback,
      overallScore: session.overallScore
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSessionsHistory = async (req, res) => {
  try {
    const history = await InterviewSession.find({ userId: req.user.id })
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startInterviewSession, submitQuestionResponse, getSessionsHistory };
