const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumeVersion: { type: String },
  coverLetterVersion: { type: String },
  atsScoreBeforeApply: { type: Number },
  atsScoreAfterOptimize: { type: Number },
  status: { type: String, enum: ['pending', 'submitted', 'failed', 'interview', 'rejected', 'offer'], default: 'pending' },
  appliedAt: { type: Date },
  notes: { type: String },
  errorLog: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
