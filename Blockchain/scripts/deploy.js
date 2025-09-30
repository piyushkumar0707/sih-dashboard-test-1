const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Path to deployed addresses JSON
const addressesFile = path.join(__dirname, "deployedAddresses.json");

// Utility: read existing JSON or initialize empty object
function readAddresses() {
  if (fs.existsSync(addressesFile)) {
    return JSON.parse(fs.readFileSync(addressesFile));
  }
  return {};
}

// Utility: write JSON
function writeAddresses(data) {
  fs.writeFileSync(addressesFile, JSON.stringify(data, null, 2));
}

async function main() {
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();

  await registry.waitForDeployment(); // ethers v6

  console.log(`✅ CredentialRegistry deployed at: ${registry.target}`);

  // Read existing addresses
  const addresses = readAddresses();

  // Save/update for Amoy network
  addresses["amoy"] = addresses["amoy"] || {};
  addresses["amoy"]["CredentialRegistry"] = registry.target;

  // Write back to JSON
  writeAddresses(addresses);

  console.log("✅ Deployed address saved to deployedAddresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
