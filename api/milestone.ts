import type { VercelRequest, VercelResponse } from '@vercel/node'
import dbConnect from './lib/mongodb.js'
import Milestone from './models/Milestone.js'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request

  try {
    await dbConnect()
  } catch (error: any) {
    console.error('Database connection failed:', error)
    return response.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: error.message
    })
  }

  switch (method) {
    case 'GET':
      try {
        const { userAddress } = request.query
        if (!userAddress) {
          return response.status(400).json({ success: false, error: 'User address required' })
        }
        const milestones = await Milestone.find({ userAddress: (userAddress as string).toLowerCase() })
        response.status(200).json({ success: true, data: milestones })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'POST':
      try {
        const { userAddress, vaultId, targetAmount, name } = request.body
        
        // Use findOneAndUpdate with upsert to keep it unique per vault
        const milestone = await Milestone.findOneAndUpdate(
          { userAddress: userAddress.toLowerCase(), vaultId },
          { name, targetAmount, createdAt: Date.now() },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        response.status(201).json({ success: true, data: milestone })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'DELETE':
      try {
        const { id } = request.query
        if (!id) {
          return response.status(400).json({ success: false, error: 'Milestone ID required' })
        }
        await Milestone.findByIdAndDelete(id)
        response.status(200).json({ success: true, data: {} })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    default:
      response.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      response.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
