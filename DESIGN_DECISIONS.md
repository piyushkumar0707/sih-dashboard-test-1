# Travira design decisions

## Why the code is split into services

The Express service owns API routing, login/JWT issuance, MongoDB persistence, and real-time event emission. The safety-score and case-report services have distinct Python dependencies and workloads: one loads a model for inference; the other renders PDFs. Keeping those concerns separate lets each process start and fail independently, at the cost of service-to-service authentication, network configuration, and more deployment steps.

The React frontend calls the Express API. The browser does not call the FastAPI services directly. The Node service forwards the authenticated bearer token to the relevant Python service, and all three services verify it against the same HS256 secret.

## Current trade-offs

- Location updates synchronously perform persistence, geofence evaluation, and a score-service request before replying. This keeps the flow straightforward to explain and avoids introducing a queue without measured need, but service latency and availability affect the request.
- MongoDB stores current tourist records and a short score history. Some list/summary handlers still load documents into Node and calculate summaries in memory.
- Socket.IO uses one process-local staff room. This is simple for a single backend instance, but multiple instances need a shared adapter and reconnect/event-delivery decisions.
- The three backend services plus the frontend and MongoDB are defined in Compose. The separate blockchain API is not part of that stack and is not required for local startup.

## What I would change at scale

First measure the end-to-end location-update path and database query plans. If measurements show synchronous scoring is a bottleneck, move score work to a durable queue and make the update response explicitly report pending scoring. If multiple API instances are needed, add a shared Socket.IO adapter and test room-level authorization and event delivery across instances. Add indexes only for query shapes confirmed by explain plans.

## Current limitations to state in an interview

The score model was trained on synthetic labels produced by rules in the repository, so its evaluation does not establish real-world predictive accuracy. There is no end-to-end load benchmark, CI workflow, or multi-instance WebSocket setup yet. The repository has backend endpoints for mobile clients but does not include a native mobile app.
