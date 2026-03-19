import mongoose from 'mongoose'

const GiftSchema = new mongoose.Schema({
  senderAddress: {
    type: String,
    required: [true, 'Please provide a sender address'],
    index: true,
  },
  recipientAddress: {
    type: String,
    required: [true, 'Please provide a recipient address'],
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
  message: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'default',
  },
  claimed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Number,
    required: [true, 'Please provide a creation timestamp'],
    default: () => Date.now(),
  },
}, { collection: 'yoVestGifts' })

export default mongoose.models.Gift || mongoose.model('Gift', GiftSchema)
