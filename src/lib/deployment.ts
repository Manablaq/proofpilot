export const deployment = {
  contractAddress: "0xEd6B2fa740D0e8130CB8b767E7084fC7257729e3",
  deploymentTx:
    "0xb091e533802a3b3a42ac85624ad9486f7921e645530c2fbf2f043efc37875d77",
  smokeTestTx:
    "0xcf2caa40864850fe62ff6050b484db9f39166c186f42923e321f3c411f4576cf",
  explorerContract:
    "https://explorer-bradbury.genlayer.com/address/0xEd6B2fa740D0e8130CB8b767E7084fC7257729e3",
  explorerTx:
    "https://explorer-bradbury.genlayer.com/tx/0xb091e533802a3b3a42ac85624ad9486f7921e645530c2fbf2f043efc37875d77",
  rpc: "https://rpc-bradbury.genlayer.com",
  network: "GenLayer Bradbury",
  smokeTestStatus: "passed",
  validatorAgreement: "5/5",
} as const;

export const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/reports" },
  { label: "Builders", href: "/builders" },
] as const;
