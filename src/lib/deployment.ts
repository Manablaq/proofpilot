export const deployment = {
  contractAddress: "0x3764DB868fd18Bd2987eD19B85E15Bc487Df841b",
  deploymentTx:
    "0xe082ba35f334a4bfa648d3150d427639fcd10e3c8181c1dab5bd3341b374373a",
  smokeTestTx: "",
  submitGenlayerTx: "",
  runReviewTx: "",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0x3764DB868fd18Bd2987eD19B85E15Bc487Df841b",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0xe082ba35f334a4bfa648d3150d427639fcd10e3c8181c1dab5bd3341b374373a",
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
