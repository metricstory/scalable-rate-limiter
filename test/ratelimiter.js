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
        rl.rateLimitFunction('test1', o => {return o});
      }
      rl.rateLimitFunction('test1', callback);
    })
  })

  describe('.rateLimitFunction with daily limit', () => {
    const rl = new RateLimiter(client, false, 5, 1, '.rate.limiter', 8, 10)

    it('will have the correct properties', () => {
      expect(rl.allowedReqsPerDay).to.equal(8);
      expect(rl.dailyTTL).to.equal(10)
    })

    it('will ratelimit for at least enough time', done => {
      const callback = (limited) => {
        const after = Date.now();
        expect(limited).to.equal(false);
        expect(after-before).to.be.above(1000);
        expect(after-before).to.be.below(2000);
        done()
      }
      const before = Date.now();
      for (var i = 0; i < 5; i++) {
        rl.rateLimitFunction('test2', o => {return o});
      }
      rl.rateLimitFunction('test2', callback);
    })

    it('will return true when over daily limit', done => {
      const firstCallback = (limited) => {
        expect(limited).to.equal(false);
      }
      const secondCallback = (limited) => {
        expect(limited).to.equal(true)
        done()
      }
      for (var i = 0; i < 2; i++) {
        rl.rateLimitFunction('test2', firstCallback);
      }
      rl.rateLimitFunction('test2', secondCallback);
    })
  })
})
