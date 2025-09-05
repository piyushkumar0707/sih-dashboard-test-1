// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRegistry {
    struct Credential {
        uint256 expiry;
        bool revoked;
    }

    mapping(bytes32 => Credential) public credentials;

    event CredentialAnchored(bytes32 vcHash, uint256 expiry);
    event CredentialRevoked(bytes32 vcHash);

    function anchorCredential(bytes32 vcHash, uint256 expiry) external {
        require(credentials[vcHash].expiry == 0, "Already exists");
        credentials[vcHash] = Credential(expiry, false);
        emit CredentialAnchored(vcHash, expiry);
    }

    function revokeCredential(bytes32 vcHash) external {
        require(credentials[vcHash].expiry != 0, "Does not exist");
        credentials[vcHash].revoked = true;
        emit CredentialRevoked(vcHash);
    }

    function isRevoked(bytes32 vcHash) external view returns (bool) {
        return credentials[vcHash].revoked;
    }
}
