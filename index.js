const fs = require('fs');
const moment = require('moment-timezone');
const luaScript = fs.readFileSync(__dirname + '/rl.lua', 'utf-8');

/**
 * This class uses a LUA script to set a count at each key (userId) to see if we have enough tokens (allowedTokensPerInterval)
 * to send the API requests. If we do not, then set a timeout and wait for the next (intervalThreshold) to send the request
 * @param {Object} redis The preconfigured redis connection
 * @param {Boolean} enableLogging Set this to enable logging
 * @param {Integer} allowedReqsPerInterval The number of allowed tokens a user can use (API requests) in time period
 * @param {Integer} intervalThreshold The interval threshold to wait before
 * @param {String}  rateLimiterNameSpace redis namespace of the rate limiter: default: '.rate.limiter'
 * @param {Integer} allowedReqsPerDay The number of allowed requests a user can make in one day
 * @param {Integer} dailyTTL How long to store daily quota usage in redis
 * @param {String} timezone Timezone for daily tally
 *
*/

class RateLimiter {
  constructor (redis,
    enableLogging = false,
    allowedReqsPerInterval = 10,
    intervalThreshold = 1,
    rateLimiterNameSpace = '.rate.limiter',
    allowedReqsPerDay = 0,
    dailyTTL = 60 * 60 * 24 * 31, // roughly a month
    timezone = 'America/Los_Angeles') {
      // Redis connection that is setup correctly
      this.redis = redis;
      // This is the number of tokens allowed per interval: ex: 10 tokens per interval
      this.allowedReqsPerInterval = allowedReqsPerInterval;
      // This is the interval Threshold length. ex: 1 sec. Redis uses units of seconds
      this.intervalThreshold = intervalThreshold;
      // Convert this into units MS (JS uses MS) Ex: 1000
      this.intervalThresholdMS = intervalThreshold * 1000;
      // Namespace for the rate limiter. ex: '.<company-name>.rate.limiter'
      this.rateLimiterNameSpace = rateLimiterNameSpace;
      // Enable logging for this library
      this.enableLogging = enableLogging;
      // Number of requests allowed in one day (reset at midnight in provided or default timezone)
      this.allowedReqsPerDay = allowedReqsPerDay;
      // How long to store quota usage in redis
      this.dailyTTL = dailyTTL
      // Timezone for daily tally
      this.timezone = timezone;
    };

  rateLimitFunction(userID, callback) {
    return this.rateLimit(userID, callback);
  }

  /**
   * Checks rate limit tokens in redis:
   * 1) Run a LUA script with the userID being the key
   * 2) Check if the incremented count at the userID is greater than the limit
   *    a) If it is greater than the limit, return the current count
   *    b) If it is not greater than the limit, just return 0
   * 3) Check if we are below the limit
   *    a) If below the limit, then call the callback immediately
   *    b) If not below the limit, then call the callback in a setTimeOut for the next interval
   *
   * The wonderful thing about using LUA is that it is single threaded and gets executed
   * in Redis. This allows for an atomic reading the key and then incrementing the key.
   * If we were to do the same logic in NodeJS we would easily run into race conditions
   * where we could asynchronously INC and GET the keys out of order. This would create
   * a condition where we would step over our limit for the rate limiter.
   * @param {String} userID
   * @param {Function} callback
   */

  async rateLimit(userID, callback) {
    const today = moment().tz(this.timezone).format('YYYY-MM-DD');
    const secondsKey = userID + this.rateLimiterNameSpace + '.seconds';
    const dailyKey = userID + this.rateLimiterNameSpace + '.daily.' + today;
    
    try {
      const o = await this.redis.eval(luaScript, {
        keys: [ secondsKey, dailyKey ],
        arguments: [ `${this.intervalThreshold}`, `${this.allowedReqsPerInterval}`, `${this.allowedReqsPerDay}`, `${this.dailyTTL}` ]
      });

      if (o > this.allowedReqsPerInterval) {
        if(this.enableLogging){
          console.log('Do Rate limiting,', o, 'requests in last', this.intervalThreshold, 'seconds')
        }
        setTimeout(() => {
          this.rateLimit(userID, callback);
        }, this.intervalThresholdMS)
      } else {
        if(callback){
          callback(o == -1);
        } else {
          return o == -1;  
        }
      }
    } catch (e) {
      if(this.enableLogging){
        console.log('Lua error in Rate Limiter: ', e);
      }
    }
  }
}

module.exports = RateLimiter
