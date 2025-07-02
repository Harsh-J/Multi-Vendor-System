import Redis from 'ioredis';
import { MongoClient } from 'mongodb';
import axios from 'axios'



let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1000; // 1 request per second

// Custom rate limiter: wait if less than 1 second since last request
async function rateLimit() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();
}