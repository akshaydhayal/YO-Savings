import mongoose from 'mongoose'

const MilestoneSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: [true, 'Please provide a user address'],
    index: true,
  },
  vaultId: {
    type: String,
    required: [true, 'Please provide a vault ID'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a goal name'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please provide a target amount'],
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
}, { collection: 'milestones' })

// Ensure uniqueness per user and vault so they don't have multiple active milestones for the same vault
MilestoneSchema.index({ userAddress: 1, vaultId: 1 }, { unique: true })

export default mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema)
