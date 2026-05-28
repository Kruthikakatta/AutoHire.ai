const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  linkedinId: { type: String },
  profilePicture: { type: String },
  resumeUrl: { type: String },
  coverLetterUrl: { type: String },
  gmailToken: { type: Object },
  plan: { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
  preferences: {
    jobTitles: [String],
    locations: [String],
    minSalary: Number,
    jobTypes: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
