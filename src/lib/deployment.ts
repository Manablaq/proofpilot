export const deployment = {
  contractAddress: "0x5E327aC97d3462B8c7B4bb4c3C4BE75b954f8504",
  deploymentTx:
    "0xa3168dddac8b51aee73a129188ac987eecb123ed8c559b0ac294952452fe073f",
  smokeTestTx: "",
  submitGenlayerTx: "",
  runReviewTx: "",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0x5E327aC97d3462B8c7B4bb4c3C4BE75b954f8504",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0xa3168dddac8b51aee73a129188ac987eecb123ed8c559b0ac294952452fe073f",
  explorerBase: "https://explorer-bradbury.genlayer.com",
  liveApp: "https://proofpilot-two.vercel.app",
  githubRepo: "https://github.com/Manablaq/proofpilot",
  rpc: "https://rpc-bradbury.genlayer.com",
  network: "GenLayer Bradbury",
  smokeTestStatus: "WORKFLOW_VERIFICATION_PENDING",
  validatorAgreement: "Not yet applicable",
  campaignId: "",
  campaignTitle: "No campaign selected",
  campaignStatus: "WORKFLOW_VERIFICATION_PENDING",
  builderAddress: "",
  submissionId: "",
  reportId: "",
  snapshotId: "",
  reviewScore: 0,
  reviewStatus: "WORKFLOW_VERIFICATION_PENDING",
  reviewRecommendation: "WORKFLOW_VERIFICATION_PENDING",
} as const;

export const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Reports", href: "/reports" },
  { label: "Builders", href: "/builders" },
] as const;
