const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String },
  optimizedText: { type: String },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  keywords: [String],
  atsScore: { type: Number },
  version: { type: Number, default: 1 },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
