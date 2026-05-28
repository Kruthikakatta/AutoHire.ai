const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String },
  description: { type: String },
  skills: [String],
  location: { type: String },
  salary: { type: String },
  deadline: { type: String },
  applyLink: { type: String },
  source: { type: String, enum: ['email', 'linkedin', 'indeed', 'glassdoor'] },
  matchScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  category: { type: String },
  status: { type: String, enum: ['new', 'matched', 'applied', 'rejected', 'interview'], default: 'new' },
  emailId: { type: String },
  extractedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
