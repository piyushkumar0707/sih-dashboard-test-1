import React, { useState } from 'react';

const BlockchainLogs = () => {
  // Mock blockchain data
  const [logs] = useState([
    {
      id: '0x1a2b3c4d5e6f...',
      type: 'Credential Issued',
      entity: 'Tourist T-001',
      timestamp: '2024-01-09 14:30:45',
      blockNumber: 12345678,
      txHash: '0x9f8e7d6c5b4a3e2d1c0b9a8f...',
      status: 'confirmed',
      gasUsed: 45000
    },
    {
      id: '0x2b3c4d5e6f7a...',
      type: 'Identity Verified',
      entity: 'Officer-123',
      timestamp: '2024-01-09 14:25:12',
      blockNumber: 12345677,
      txHash: '0x8e7d6c5b4a3e2d1c0b9a8f7e...',
      status: 'confirmed',
      gasUsed: 32000
    },
    {
      id: '0x3c4d5e6f7a8b...',
      type: 'Incident Logged',
      entity: 'INC-2024-001',
      timestamp: '2024-01-09 14:20:33',
      blockNumber: 12345676,
      txHash: '0x7d6c5b4a3e2d1c0b9a8f7e6d...',
      status: 'pending',
      gasUsed: 28000
    },
    {
      id: '0x4d5e6f7a8b9c...',
      type: 'Safety Score Updated',
      entity: 'Tourist T-003',
      timestamp: '2024-01-09 14:15:21',
      blockNumber: 12345675,
      txHash: '0x6c5b4a3e2d1c0b9a8f7e6d5c...',
      status: 'confirmed',
      gasUsed: 21000
    }
  ]);

  const [credentials] = useState([
    {
      id: 'CRED-001',
      holder: 'Tourist T-001',
      type: 'Tourism Visa',
      issuer: 'Tourism Authority',
      issueDate: '2024-01-01',
      expiryDate: '2024-12-31',
      status: 'active',
      verified: true
    },
    {
      id: 'CRED-002',
      holder: 'Officer-123',
      type: 'Officer Badge',
      issuer: 'Police Department',
      issueDate: '2023-06-15',
      expiryDate: '2025-06-15',
      status: 'active',
      verified: true
    },
    {
      id: 'CRED-003',
      holder: 'Tourist T-002',
      type: 'Emergency Contact',
  issuer: 'Travira',
      issueDate: '2024-01-08',
      expiryDate: '2024-01-15',
      status: 'active',
      verified: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('logs');

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-700 bg-green-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCredentialStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'expired': return 'text-red-700 bg-red-100';
      case 'suspended': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const stats = {
    totalTransactions: logs.length,
    confirmedTx: logs.filter(l => l.status === 'confirmed').length,
    activeCredentials: credentials.filter(c => c.status === 'active').length,
    verifiedCredentials: credentials.filter(c => c.verified).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Blockchain Credentials & Logs</h2>
        <p className="text-gray-600">Digital identity verification and audit trail on blockchain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.confirmedTx}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Active Credentials</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeCredentials}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Verified</p>
          <p className="text-3xl font-bold text-gray-900">{stats.verifiedCredentials}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('logs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
              Transaction Logs
            </button>
            <button onClick={() => setActiveTab('credentials')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'credentials' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
              Credentials
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{log.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>{log.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">Block #{log.blockNumber}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Entity: {log.entity}</div>
                  <div className="mt-1 text-xs text-gray-500 space-x-4">
                    <span>Tx: {log.txHash}</span>
                    <span>Gas: {log.gasUsed.toLocaleString()}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-3">
              {credentials.map(cred => (
                <div key={cred.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{cred.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCredentialStatusColor(cred.status)}`}>{cred.status}</span>
                      {cred.verified && <span className="text-green-600 text-xs">✓ Verified</span>}
                    </div>
                    <div className="text-xs text-gray-500">{cred.id}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Holder: {cred.holder}</div>
                  <div className="mt-1 text-xs text-gray-500 space-x-4">
                    <span>Issuer: {cred.issuer}</span>
                    <span>Issued: {cred.issueDate}</span>
                    <span>Expires: {cred.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainLogs;
