import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../contracts/proofpilot.py', import.meta.url), 'utf8')
const response = await fetch('https://rpc-bradbury.genlayer.com', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'gen_getContractSchema',
    params: [{ code: Buffer.from(source).toString('base64') }],
    id: 1,
  }),
})

if (!response.ok) throw new Error(`Schema request failed with HTTP ${response.status}.`)
const payload = await response.json()
if (payload.error || !payload.result?.methods) throw new Error(`GenLayer schema rejected the contract: ${payload.error?.message ?? 'unknown error'}`)

for (const name of [
  'create_campaign', 'submit_project', 'run_review', 'request_recheck', 'open_appeal',
  'resolve_appeal', 'record_human_decision', 'get_report_decisions', 'list_campaigns',
]) {
  if (!payload.result.methods[name]) throw new Error(`Schema is missing required ${name} method.`)
}

console.log(JSON.stringify({
  schema: 'OK',
  constructorParameters: payload.result.ctor?.params ?? [],
  methods: Object.keys(payload.result.methods).sort(),
}, null, 2))
