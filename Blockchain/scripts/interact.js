const { ethers } = require("hardhat");
const { keccak256, toUtf8Bytes } = require("ethers");
const fs = require("fs");
const path = require("path");

// JSON log file for credentials
const logFilePath = path.join(__dirname, "credentialsLog.json");

// Read existing log or initialize
function readLog() {
  if (fs.existsSync(logFilePath)) {
    return JSON.parse(fs.readFileSync(logFilePath));
  }
  return [];
}

// Write log
function writeLog(data) {
  fs.writeFileSync(logFilePath, JSON.stringify(data, null, 2));
}

async function main() {
  // Read contract address from deployedAddresses.json
  const addresses = require("./deployedAddresses.json"); // adjust path
  const contractAddress = addresses["amoy"]["CredentialRegistry"];
  if (!contractAddress) {
    throw new Error("Contract address not found in deployedAddresses.json");
  }

  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.attach(contractAddress);

  // Generate a unique credential
  const uniqueString = "credential-" + Date.now(); // timestamp-based uniqueness
  const vcHash = keccak256(toUtf8Bytes(uniqueString));
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days

  // Read existing log
  const log = readLog();

  // Check if credential already exists on-chain
  const existingCredential = await registry.credentials(vcHash).catch(() => null);

  if (!existingCredential || existingCredential.expiry == 0) {
    // Anchor credential
    console.log("Anchoring credential...");
    const tx1 = await registry.anchorCredential(vcHash, expiry);
    await tx1.wait();
    console.log(`✅ Anchored: ${vcHash} with expiry ${expiry}`);

    log.push({
      vcHash: vcHash,
      expiry: expiry,
      revoked: false,
      action: "anchored",
      timestamp: Math.floor(Date.now() / 1000),
    });
    writeLog(log);
  } else {
    console.log("Credential already exists on-chain, skipping anchor.");
  }

  // Revoke credential
  console.log("Revoking credential...");
  const tx2 = await registry.revokeCredential(vcHash);
  await tx2.wait();
  console.log(`✅ Revoked: ${vcHash}`);

  log.push({
    vcHash: vcHash,
    expiry: expiry,
    revoked: true,
    action: "revoked",
    timestamp: Math.floor(Date.now() / 1000),
  });
  writeLog(log);

  // Check revoked status
  const revokedAfter = await registry.isRevoked(vcHash);
  console.log("Revoked after?:", revokedAfter);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
