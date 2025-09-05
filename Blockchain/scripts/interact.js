const { ethers } = require("hardhat");

async function main() {
  const registryAddress = "DEPLOYED_CONTRACT_ADDRESS";
  const Registry = await ethers.getContractFactory("CredentialRegistry");
  const registry = Registry.attach(registryAddress);

  // Example VC hash
  const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("tourist123"));
  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  const tx = await registry.anchorCredential(vcHash, expiry);
  await tx.wait();
  console.log("Anchored VC:", vcHash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
