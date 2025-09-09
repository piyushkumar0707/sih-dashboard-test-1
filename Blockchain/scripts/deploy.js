const { ethers } = require("hardhat");

async function main() {
  const Registry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await Registry.deploy();
  await registry.deployed();

  console.log("CredentialRegistry deployed to:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
