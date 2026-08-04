import { readFile } from 'node:fs/promises'
import { createAccount, createClient } from 'genlayer-js'
import { testnetBradbury } from 'genlayer-js/chains'
import { TransactionStatus } from 'genlayer-js/types'

const privateKey = (process.env.GENLAYER_DEPLOYER_PK ?? '').trim()
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error('GENLAYER_DEPLOYER_PK must be a 32-byte 0x-prefixed private key. It is never printed.')
  process.exit(1)
}

const explorer = 'https://explorer-bradbury.genlayer.com'
const client = createClient({ chain: testnetBradbury, account: createAccount(privateKey) })
const code = await readFile(new URL('../contracts/proofpilot.py', import.meta.url), 'utf8')
const deployTransactionHash = await client.deployContract({ code })
console.log(`Submitted ProofPilot V10 deployment: ${explorer}/tx/${deployTransactionHash}`)

const receipt = await client.waitForTransactionReceipt({ hash: deployTransactionHash, status: TransactionStatus.ACCEPTED, interval: 5_000, retries: 180 })
if (receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN') {
  throw new Error(`V10 deployment did not execute successfully: ${receipt.txExecutionResultName ?? 'UNKNOWN'}. Do not configure the frontend or redeploy blindly.`)
}

const contractAddress = receipt.recipient
if (!/^0x[0-9a-fA-F]{40}$/.test(contractAddress ?? '') || /^0x0{40}$/i.test(contractAddress)) {
  throw new Error('Deployment was accepted but no usable contract address was returned. Inspect the submitted transaction before taking any further action.')
}

let campaigns = null
let rpcReadError = null
for (let attempt = 0; attempt < 12; attempt += 1) {
  try {
    const raw = await client.readContract({ address: contractAddress, functionName: 'list_campaigns', args: [0, 1], stateStatus: 'accepted' })
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) { campaigns = parsed; break }
    rpcReadError = 'list_campaigns returned an unexpected value.'
  } catch (error) {
    rpcReadError = error instanceof Error ? error.shortMessage ?? error.message : String(error)
  }
  await new Promise(resolve => setTimeout(resolve, 10_000))
}

console.log(JSON.stringify({
  release: 'V10', deployTransactionHash, contractAddress, listCampaigns: campaigns,
  state: campaigns ? 'ACCEPTED_AND_READABLE' : 'ACCEPTED_EXECUTION_CONFIRMED_RPC_SYNC_PENDING',
  rpcReadError: campaigns ? null : rpcReadError,
  next: campaigns ? 'Wait for FINALIZED in GenExplorer. Then test the governance workflow before updating src/lib/deployment.ts or Vercel.' : `Do not redeploy. Recheck ${contractAddress} after public RPC syncs.`,
}, null, 2))
