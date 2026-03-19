import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gift, Send, Loader2, CheckCircle2, Info } from 'lucide-react'
import { useAccount, useChainId, useSendTransaction, useConfig, useEnsAddress } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { useVaults, useYoClient } from '@yo-protocol/react'
import { parseTokenAmount, VAULTS } from '@yo-protocol/core'
import { waitForTransactionReceipt } from '@wagmi/core'

const FNUM = "'DM Mono', 'Fira Code', monospace"

const THEMES = [
  { id: 'classic', name: 'Classic Blue', color: '#627EEA', emoji: '🎁' },
  { id: 'gold', name: 'Golden Celebration', color: '#FFAF4F', emoji: '✨' },
  { id: 'energy', name: 'Nitro Green', color: '#d6ff34', emoji: '⚡' },
  { id: 'love', name: 'With Love', color: '#FF5E5E', emoji: '❤️' },
]

export default function GiftPage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const config = useConfig()
  const { vaults, isLoading: vaultsLoading } = useVaults()
  const client = useYoClient()
  const { sendTransactionAsync } = useSendTransaction()
  
  const [recipient, setRecipient] = useState('')
  const [vaultId, setVaultId] = useState('yoUSD')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState(THEMES[0])
  const [isSending, setIsSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'idle' | 'resolving' | 'approving' | 'depositing' | 'saving'>('idle')

  // Resolve Base Name / ENS if needed
  const { data: resolvedAddress, isLoading: resolving } = useEnsAddress({
    name: (recipient.includes('.') && !recipient.endsWith('.base')) ? recipient : undefined,
    chainId: mainnet.id // ENS is on Mainnet
  })

  // Note: Base names (.base) might need a specific resolver if not synced to ENS.
  // For now, we assume if it's a 0x address, we use it directly.
  // If it's a name, we try to resolve it.
  const finalRecipient = useMemo(() => {
    if (recipient.startsWith('0x')) return recipient
    return resolvedAddress || recipient
  }, [recipient, resolvedAddress])

  const selectedVault = useMemo(() => {
    if (!vaults) return null
    const vaultConfig = (VAULTS as any)[vaultId]
    const targetAddr = vaultConfig?.address
    
    if (!targetAddr) {
        console.warn(`No target address found for vault ${vaultId}`, vaultConfig)
        return null
    }

    // Try to find by address (case-insensitive)
    const match = vaults.find((v: any) => {
        const addr = (v.contracts?.vaultAddress || v.address)?.toLowerCase()
        return addr === targetAddr.toLowerCase()
    })
    
    // Fallback: Try to find by ID or symbol if address match fails
    if (!match) {
        return vaults.find((v: any) => 
            v.id === vaultId || 
            v.symbol === vaultId || 
            v.name?.includes(vaultId.replace('yo', ''))
        )
    }
    
    return match
  }, [vaults, vaultId, chainId])

  const handleSendGift = async () => {
    console.log('Sending gift...', { address, recipient, amount, hasClient: !!client, selectedVault: !!selectedVault })
    
    if (!address) { setError('Please connect your wallet'); return }
    
    // Validation
    const isAmountValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
    const isRecipientValid = recipient.length >= 42 || recipient.includes('.')
    
    if (!isRecipientValid) { setError('Please enter a valid wallet address or Base Name (.base)'); return }
    if (!isAmountValid) { setError('Please enter a valid amount greater than 0'); return }
    if (!client) { setError(`Yo Protocol Client not ready (Network: ${chainId ?? 'Unknown'}). Please check your connection.`); return }
    if (!selectedVault) { setError(`Vault ${vaultId.replace('yo','')} not supported on the current network (${chainId ?? 8453}). Please switch to Base Mainnet.`); return }

    const targetRecipient = finalRecipient
    if (!targetRecipient.startsWith('0x')) {
        setError('Could not resolve recipient name to a valid address. Please use a wallet address.');
        return
    }

    setIsSending(true)
    setError('')
    try {
      const decimals = (selectedVault as any).asset?.decimals || 6
      const amountRaw = parseTokenAmount(amount, decimals)
      const tokenAddr = VAULTS[vaultId as keyof typeof VAULTS]?.underlying?.address?.[chainId ?? 8453]
      const vaultAddr = (selectedVault as any).contracts?.vaultAddress || (selectedVault as any).address

      if (!tokenAddr) throw new Error('Token address not found for this vault')

      // 1. Prepare transactions (Approval + Deposit)
      setStep('approving')
      const txs = await client.prepareDepositWithApproval({
        vault: vaultAddr,
        token: tokenAddr,
        amount: amountRaw,
        owner: address as `0x${string}`,
        recipient: targetRecipient as `0x${string}`,
        chainId: chainId ?? 8453
      })

      // 2. Execute Transactions
      for (const tx of txs) {
        if (tx.data.startsWith('0x095ea7b3')) { // approve hash prefix
            setStep('approving')
        } else {
            setStep('depositing')
        }
        const hash = await sendTransactionAsync({
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}`,
          value: tx.value
        })
        await waitForTransactionReceipt(config, { hash })
      }

      // 3. Save Metadata to DB
      setStep('saving')
      const res = await fetch('/api/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAddress: address,
          recipientAddress: recipient.toLowerCase(),
          vaultId,
          amount,
          message,
          theme: theme.id,
        })
      })
      
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to save gift metadata')

      setSuccess(true)
    } catch (err: any) {
      console.error('Gift failed:', err)
      setError(err.message || 'Transaction failed or was rejected')
    } finally {
      setIsSending(false)
      setStep('idle')
    }
  }


  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ display: 'inline-flex', padding: 12, borderRadius: 20, background: 'rgba(214,255,52,0.1)', border: '1px solid rgba(214,255,52,0.2)', marginBottom: 20 }}
        >
          <Gift size={32} color="#d6ff34" />
        </motion.div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: '0 0 10px' }}>Yo-Gift</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>Send yield-bearing assets directly to a friend.</p>
      </div>

      {!success ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Recipient */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Recipient Address</label>
              <input 
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="0x..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 15, outline: 'none' }}
              />
            </div>

            {/* Amount & Vault */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Amount (USD)</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 16, outline: 'none', fontFamily: FNUM }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Vault</label>
                <select 
                  value={vaultId}
                  onChange={e => setVaultId(e.target.value)}
                  style={{ width: '100%', height: 52, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '0 12px', color: '#fff', fontSize: 14, outline: 'none', appearance: 'none' }}
                >
                  <option value="yoUSD">USDC</option>
                  <option value="yoETH">WETH</option>
                  <option value="yoBTC">cbBTC</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Social Message</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hope this grows fast! Happy Birthday!"
                rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', color: '#fff', fontSize: 15, outline: 'none', resize: 'none' }}
              />
            </div>

            {/* Themes */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Card Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {THEMES.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setTheme(t)}
                    style={{ 
                      padding: '12px 4px', borderRadius: 12, border: '1px solid', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      borderColor: theme.id === t.id ? t.color : 'rgba(255,255,255,0.05)',
                      background: theme.id === t.id ? `${t.color}20` : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{t.emoji}</div>
                    {t.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Recipient gets</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Yield-bearing {vaultId.replace('yo', '')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Social metadata</span>
                <span style={{ fontSize: 12, color: theme.color, fontWeight: 600 }}>{theme.name} Theme</span>
              </div>
            </div>
            
            {error && (
                <div style={{ padding: 12, background: 'rgba(255,94,94,0.1)', border: '1px solid rgba(255,94,94,0.2)', borderRadius: 12, color: '#FF5E5E', fontSize: 12 }}>
                    {error}
                </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSendGift}
              disabled={isSending || vaultsLoading || resolving}
              style={{ 
                width: '100%', padding: '18px', borderRadius: 16, background: '#d6ff34', color: '#000', fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: (isSending || vaultsLoading || resolving) ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', opacity: (isSending || vaultsLoading || resolving) ? 0.6 : 1
              }}
            >
              {isSending || vaultsLoading || resolving ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
              {resolving ? 'Resolving Name...' : vaultsLoading ? 'Loading Vaults...' : isSending ? step.charAt(0).toUpperCase() + step.slice(1) + '...' : 'Send Yo-Gift'}
            </button>

          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', background: 'rgba(13,17,23,0.7)', border: '1px solid #d6ff3440', borderRadius: 24, padding: '48px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(214,255,52,0.1)', border: '1px solid #d6ff3430', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} color="#d6ff34" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>Gift Successfully Sent!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            The {vaultId.replace('yo', '')} shares have been transferred to <br />
            <b style={{ color: '#fff', fontFamily: FNUM }}>{recipient.slice(0,6)}...{recipient.slice(-4)}</b>. <br />
            They can see your message on their dashboard now!
          </p>
          <button 
            onClick={() => { setSuccess(false); setRecipient(''); setAmount(''); setMessage(''); }}
            style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Send Another Gift
          </button>
        </motion.div>
      )}

      {/* ── Info ── */}
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: 'rgba(214,255,52,0.03)', borderRadius: 16, border: '1px solid rgba(214,255,52,0.08)' }}>
        <Info size={16} color="#d6ff34" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
          Yo-Gifts are direct transfers of yield-bearing vault shares. Your friend earns interest the moment the gift arrives. <b>No claim necessary.</b>
        </p>
      </div>

    </div>
  )
}
