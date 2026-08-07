export const deployment = {
  governanceWorkflowEnabled: true,
  contractAddress: "0x4FCf070e2dB9Fc0f54f7849BA58260FedD881D6A",
  deploymentTx:
    "0x2a568e2f999401ca3f53de5df0f03f8ea01762feaf0670bb0897416476570d0c",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0x4FCf070e2dB9Fc0f54f7849BA58260FedD881D6A",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0x2a568e2f999401ca3f53de5df0f03f8ea01762feaf0670bb0897416476570d0c",
  explorerBase: "https://explorer-bradbury.genlayer.com",
  liveApp: "https://proofpilot-two.vercel.app",
  githubRepo: "https://github.com/Manablaq/proofpilot",
  rpc: "https://rpc-bradbury.genlayer.com",
  network: "GenLayer Bradbury",
  smokeTestStatus: "GOVERNANCE_WORKFLOW_FINALIZED",
  validatorAgreement: "Governance workflow finalized on Bradbury",
  campaignId: "campaign_1",
  campaignTitle: "ProofPilot governance acceptance test",
  campaignStatus: "ACTIVE",
  builderAddress: "0x5bB49021001200fE8156a81c7fcF097e535e7181",
  submissionId: "submission_1",
  reportId: "report_2",
  snapshotId: "snapshot_2",
  reviewScore: 100,
  reviewStatus: "READY_FOR_REVIEW",
  reviewRecommendation: "APPROVE_FOR_HUMAN_REVIEW",
} as const;

export const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Reports", href: "/reports" },
  { label: "Builders", href: "/builders" },
] as const;
