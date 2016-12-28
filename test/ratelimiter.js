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

  describe('.rateLimitFunction without daily limit', () => {
    const rl = new RateLimiter(client);

    it('will call the supplied callback', done => {
      const callback = (limited) => {
        expect(limited).to.equal(false);
        done();
      }
      rl.rateLimitFunction('user', callback)
    })

    it('will ratelimit for at least enough time', done => {
      const callback = (limited) => {
        const after = Date.now();
        expect(limited).to.equal(false);
        expect(after-before).to.be.above(1000)
        expect(after-before).to.be.below(2000)
        done()
      }
      const before = Date.now();
      for (var i = 0; i < 10; i++) {
        rl.rateLimitFunction('user', o => {return o});
      }
      rl.rateLimitFunction('user', callback);
    })
  })
})
