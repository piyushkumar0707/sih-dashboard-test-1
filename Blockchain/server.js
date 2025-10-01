require("dotenv").config({ path: "../.env" }); // load .env first
console.log("ALCHEMY_AMOY_URL:", process.env.ALCHEMY_AMOY_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Loaded" : "Missing");

const express = require("express");
const bodyParser = require("body-parser"); // optional, can use express.json()
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json()); // parse JSON bodies

// Optional root route to avoid "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Credential Registry API is running!");
});

const PORT = process.env.PORT || 4000;

// Paths
const deployedFile = path.join(__dirname, "scripts", "deployedAddresses.json");

// Read deployed contract address
function getContractAddress() {
  const addresses = JSON.parse(fs.readFileSync(deployedFile));
  return addresses[process.env.NETWORK]["CredentialRegistry"];
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_AMOY_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = getContractAddress();
const CredentialRegistry = require("./artifacts/Contracts/CredentialRegistry.sol/CredentialRegistry.json");
const registry = new ethers.Contract(contractAddress, CredentialRegistry.abi, signer);

// JSON log file
const logFilePath = path.join(__dirname, "credentialsLog.json");
function readLog() {
  if (fs.existsSync(logFilePath)) {
    return JSON.parse(fs.readFileSync(logFilePath));
  }
  return [];
}
function writeLog(data) {
  fs.writeFileSync(logFilePath, JSON.stringify(data, null, 2));
}

// POST /anchor
app.post("/anchor", async (req, res) => {
  try {
    const { credential } = req.body;
    const vcHash = ethers.keccak256(ethers.toUtf8Bytes(credential));
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days

    const existing = await registry.credentials(vcHash).catch(() => null);
    if (existing && existing.expiry != 0) {
      return res.status(400).json({ error: "Credential already exists" });
    }

    const tx = await registry.anchorCredential(vcHash, expiry);
    await tx.wait();

    const log = readLog();
    log.push({
      vcHash,
      expiry,
      revoked: false,
      action: "anchored",
      timestamp: Math.floor(Date.now() / 1000),
    });
    writeLog(log);

    res.json({ message: "Credential anchored", vcHash, expiry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /revoke
app.post("/revoke", async (req, res) => {
  try {
    const { vcHash } = req.body;

    const tx = await registry.revokeCredential(vcHash);
    await tx.wait();

    const log = readLog();
    log.push({
      vcHash,
      revoked: true,
      action: "revoked",
      timestamp: Math.floor(Date.now() / 1000),
    });
    writeLog(log);

    res.json({ message: "Credential revoked", vcHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /status/:vcHash
app.get("/status/:vcHash", async (req, res) => {
  try {
    const { vcHash } = req.params;
    const credential = await registry.credentials(vcHash);
    if (credential.expiry === 0) {
      return res.status(404).json({ message: "Credential not found" });
    }

    const revoked = await registry.isRevoked(vcHash);
    res.json({ vcHash, expiry: Number(credential.expiry), revoked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
