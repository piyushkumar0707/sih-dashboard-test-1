const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const mongoose = require('mongoose');
const Tourist = require('../models/Tourist');

const mongoUri = process.env.MONGODB_URI;

test('concurrent score updates from stale Tourist documents preserve every history entry', async (t) => {
  if (!mongoUri) {
    t.skip('Set MONGODB_URI to a disposable MongoDB test database');
    return;
  }

  await mongoose.connect(mongoUri);
  const touristId = `test-concurrency-${new mongoose.Types.ObjectId()}`;
  let tourist;

  try {
    tourist = await Tourist.create({
      touristId,
      name: 'Concurrency regression test',
      location: { lat: 0, lng: 0 },
      safetyScore: 85,
      scoreHistory: []
    });

    // Simulate requests that all read the same version before writing a score.
    const staleDocuments = await Promise.all(
      Array.from({ length: 20 }, () => Tourist.findById(tourist._id))
    );
    await Promise.all(staleDocuments.map((doc) => doc.updateSafetyScore(40)));

    const saved = await Tourist.findById(tourist._id).lean();
    assert.equal(saved.safetyScore, 40);
    assert.equal(saved.status, 'high-risk');
    assert.equal(saved.scoreHistory.length, 20);
    assert.ok(saved.scoreHistory.every((entry) => entry.score === 40));
  } finally {
    if (tourist) await Tourist.deleteOne({ _id: tourist._id });
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
