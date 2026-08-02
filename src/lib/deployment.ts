export const deployment = {
  contractAddress: "0x35B51C656609507203093B7D9976F1C856e6B86e",
  deploymentTx:
    "0x5205519d400e5ba3359ecae4858a0396fc2fd465d4397af05e8956e6d3986be5",
  smokeTestTx: "",
  submitGenlayerTx: "",
  runReviewTx: "",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0x35B51C656609507203093B7D9976F1C856e6B86e",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0x5205519d400e5ba3359ecae4858a0396fc2fd465d4397af05e8956e6d3986be5",
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
