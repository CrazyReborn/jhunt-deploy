const mongoose = require('mongoose');

const { Schema } = mongoose;

const OfferSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  received: { type: Date, required: true },
  interview: { type: Schema.Types.ObjectId, ref: 'Interview', required: false },
});

module.exports = mongoose.model('Offer', OfferSchema);
