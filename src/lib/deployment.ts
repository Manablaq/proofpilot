export const deployment = {
  contractAddress: "0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87",
  deploymentTx:
    "0x9a5add3f91daa277f1a09d27e0dd83ee27ec3d04c132c29c7e89e7b9d62d5877",
  smokeTestTx:
    "0x8a218d872394e7ef393ae3cd3c5c42c8b25d97afab67f550548f60db5b9eb99b",
  submitGenlayerTx:
    "0x550e04c381b332ceae70fb3d9b3a4e5bbce8bb1955fad9b7229672d2db6fabb4",
  runReviewTx:
    "0x03dce7d374e767e4a99b9b8b6da51e5a704aa8ba402c96081723f32a882ab1f8",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0xC11b90c7c2C1C9F7E99ef767c80a7AD7Bc3F6f87",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0x9a5add3f91daa277f1a09d27e0dd83ee27ec3d04c132c29c7e89e7b9d62d5877",
  explorerBase: "https://explorer-bradbury.genlayer.com",
  liveApp: "https://proofpilot-two.vercel.app",
  githubRepo: "https://github.com/Manablaq/proofpilot",
  rpc: "https://rpc-bradbury.genlayer.com",
  network: "GenLayer Bradbury",
  smokeTestStatus: "passed",
  validatorAgreement: "5/5",
  campaignId: "campaign_1",
  campaignTitle: "ProofPilot Smoke Test",
  campaignStatus: "ACTIVE",
  builderAddress: "0x1f87Ae197af539253978d435aD45cCf28Fb95024",
  submissionId: "submission_1",
  reportId: "report_1",
  snapshotId: "snapshot_1",
  reviewScore: 61,
  reviewStatus: "NEEDS_MINOR_FIXES",
  reviewRecommendation: "REQUEST_MINOR_CHANGES",
} as const;

export const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Reports", href: "/reports" },
  { label: "Builders", href: "/builders" },
] as const;
