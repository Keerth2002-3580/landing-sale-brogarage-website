const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land', // optional if payment is for subscription
    },
    amount: {
      type: Number,
      required: [true, 'Please add a payment amount'],
    },
    type: {
      type: String,
      enum: ['featured_ad', 'agent_subscription'],
      required: [true, 'Please add a payment type'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', PaymentSchema);
