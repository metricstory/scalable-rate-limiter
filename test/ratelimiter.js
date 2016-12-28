const expect = require('chai').expect;
const RateLimiter = require('../index.js');
const redis = require('redis');
const client = redis.createClient();

describe('RateLimiter', () => {
  describe('instantiation', () => {
    it('will produce the correct values', () => {
      const rl = new RateLimiter(client, true, 4, 2, '.rate.limit', 10)
      expect(rl.redis).to.equal(client);
      expect(rl.allowedReqsPerInterval).to.equal(4);
      expect(rl.intervalThreshold).to.equal(2);
      expect(rl.rateLimiterNameSpace).to.equal('.rate.limit');
      expect(rl.allowedReqsPerDay).to.equal(10);
      expect(rl.enableLogging).to.equal(true)
    })
  })
})
