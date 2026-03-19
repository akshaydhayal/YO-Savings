import type { VercelRequest, VercelResponse } from '@vercel/node'
import dbConnect from './lib/mongodb.js'
import Gift from './models/Gift.js'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request

  try {
    await dbConnect()
  } catch (error: any) {
    return response.status(500).json({ success: false, error: 'Database connection failed' })
  }

  switch (method) {
    case 'GET':
      try {
        const { recipientAddress } = request.query
        if (!recipientAddress) {
          return response.status(400).json({ success: false, error: 'Recipient address required' })
        }
        // Fetch unclaimed gifts for this recipient
        const gifts = await Gift.find({ 
          recipientAddress: (recipientAddress as string).toLowerCase(),
          claimed: false 
        })
        response.status(200).json({ success: true, data: gifts })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'POST':
      try {
        const { senderAddress, recipientAddress, vaultId, amount, message, theme } = request.body
        const gift = await Gift.create({
          senderAddress: senderAddress.toLowerCase(),
          recipientAddress: recipientAddress.toLowerCase(),
          vaultId,
          amount,
          message,
          theme,
          claimed: false,
          createdAt: Date.now(),
        })
        response.status(201).json({ success: true, data: gift })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'PUT':
      // Mark gift as claimed/seen
      try {
        const { id } = request.query
        const gift = await Gift.findByIdAndUpdate(id, { claimed: true }, { new: true })
        response.status(200).json({ success: true, data: gift })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    default:
      response.setHeader('Allow', ['GET', 'POST', 'PUT'])
      response.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
