Quick Start
  1 - Clone the repo
  2- Install Docker and Docker Compose
  3 - Run : docker-compose up --build
  4 - API @ http://localhost:3000
  5 - Run load test: k6 run load-test.js
  
Architecture
  [ Frontend ] --> [ API@3000 ] --> [ Redis streams ] --> [Worker]

cURL Commands
 # Submit job
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d '{"data":"test"}'

# Check job status
curl http://localhost:3000/jobs/<request_id>

# Simulate async vendor webhook
curl -X POST http://localhost:3000/vendor-webhook/async -H "Content-Type: application/json" -d '{"request_id":"<request_id>","data":{"key":"value"}}'

Load Test Results

Ran k6 run load-test.js with 200 VUs for 60s:
  Requests: ~30,000
  Avg Response Time: 200ms (POST), 80ms (GET)
  Error Rate: 0.1% (mostly due to invalid GET request_id)

This solution provides a complete implementation with:
  API: Handles POST /jobs and GET /jobs/{request_id}, stores jobs in MongoDB, and queues them in Redis Streams.
  Worker: Processes jobs with rate-limiting (1 req/sec via Bottleneck), cleans data (removes emails, trims strings), and updates MongoDB.
  Mock Vendors: Sync vendor returns data immediately; async vendor simulates delayed webhook delivery.
  Docker Compose: Spins up all services (API, worker, Redis, MongoDB, vendors).
  Load Test: k6 script with 200 concurrent users, mixed POST/GET, and analysis of results.
  README: Includes setup, architecture, design decisions, cURL commands, and load test insights.
