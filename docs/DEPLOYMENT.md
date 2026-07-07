# ProofPilot Deployment

## Bradbury Deployment

| Field | Value |
| --- | --- |
| Network | GenLayer Bradbury Testnet |
| RPC | `https://rpc-bradbury.genlayer.com` |
| Contract address | `0xEd6B2fa740D0e8130CB8b767E7084fC7257729e3` |
| Deployment transaction hash | `0xb091e533802a3b3a42ac85624ad9486f7921e645530c2fbf2f043efc37875d77` |
| Deployment status | Successful |
| Current deployed contract source | `contracts/proofpilot.py` |
| Current deployed commit | `85e46d7 refactor: slim ProofPilot contract for deployment` |

## Explorer Links

- Contract: https://explorer-bradbury.genlayer.com/address/0xEd6B2fa740D0e8130CB8b767E7084fC7257729e3
- Transaction: https://explorer-bradbury.genlayer.com/tx/0xb091e533802a3b3a42ac85624ad9486f7921e645530c2fbf2f043efc37875d77

## Receipt Summary

- Result: `1`
- Transaction execution result: `1`
- Validators agreed: `5/5`

## Deployment Notes

The original larger contract source failed deployment with `BlockPubdataLimitReached`. This successful Bradbury deployment uses the slim v1 contract from `contracts/proofpilot.py`.
