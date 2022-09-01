const mongoose = require('mongoose');

const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company_name: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: [
      'Application sent',
      'No answer',
      'No offer',
      'Phone call',
      'Interview',
      'Offered',
    ],
    default: 'Application sent',
  },
  date: { type: Date },
  jobLink: { type: String },
  location: { type: String },
  qualifications_met: {
    type: String,
    required: true,
    enum: ['Fully met', 'Mostly met', 'Half are met', 'Mostly unmet', 'Fully unmet'],
    default: 'Half are met',
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
