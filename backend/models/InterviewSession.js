const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  questions: [{
    questionText: { type: String, required: true },
    category: { type: String, enum: ['technical', 'behavioral'], required: true },
    modelAnswer: { type: String },
    userAnswerText: { type: String },
    confidenceScore: { type: Number, default: 0 },
    similarityScore: { type: Number, default: 0 },
    facialSentiment: { type: String },
    feedback: { type: String }
  }],
  overallScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
