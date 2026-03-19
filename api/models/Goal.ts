import mongoose from 'mongoose'

const GoalSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: [true, 'Please provide a user address'],
    index: true,
  },
  vaultId: {
    type: String,
    required: [true, 'Please provide a vault ID'],
  },
  amount: {
    type: String,
    required: [true, 'Please provide an amount'],
  },
  period: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: [true, 'Please provide a period'],
  },
  createdAt: {
    type: Number,
    required: [true, 'Please provide a creation timestamp'],
    default: () => Date.now(),
  },
}, { collection: 'yoVest' })

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema)
