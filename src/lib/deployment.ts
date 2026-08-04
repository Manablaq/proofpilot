export const deployment = {
  protocolVersion: "v9",
  governanceWorkflowEnabled: false,
  contractAddress: "0x5E327aC97d3462B8c7B4bb4c3C4BE75b954f8504",
  deploymentTx:
    "0xa3168dddac8b51aee73a129188ac987eecb123ed8c559b0ac294952452fe073f",
  smokeTestTx: "0xfdfb62a1e2c883ab89b8a705282a3c11c3ad1027a8984a0df4ae67605cd59be4",
  submitGenlayerTx: "",
  runReviewTx: "0xfdfb62a1e2c883ab89b8a705282a3c11c3ad1027a8984a0df4ae67605cd59be4",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0x5E327aC97d3462B8c7B4bb4c3C4BE75b954f8504",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0xa3168dddac8b51aee73a129188ac987eecb123ed8c559b0ac294952452fe073f",
  explorerBase: "https://explorer-bradbury.genlayer.com",
  liveApp: "https://proofpilot-two.vercel.app",
  githubRepo: "https://github.com/Manablaq/proofpilot",
  rpc: "https://rpc-bradbury.genlayer.com",
  network: "GenLayer Bradbury",
  smokeTestStatus: "END_TO_END_FIXTURE_FINALIZED",
  validatorAgreement: "Accepted and finalized on Bradbury",
  campaignId: "campaign_1",
  campaignTitle: "ProofPilot public release acceptance",
  campaignStatus: "ACTIVE",
  builderAddress: "0x5bB49021001200fE8156a81c7fcF097e535e7181",
  submissionId: "submission_1",
  reportId: "report_1",
  snapshotId: "snapshot_1",
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
