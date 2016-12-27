"use strict";

/*
*
* MIT License
*
* Copyright 2017 will@metricstory.com, brandon@metricstory.com
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
* IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/

/**
 * This class uses a LUA script to set a count at each key (userId) to see if we have enough tokens (allowedTokensPerInterval)
 * to send the API requests. If we do not, then set a timeout and wait for the next (intervalThreshold) to send the request
 * @param {Object} redis The preconfigured redis connection
 * @param {Boolean} enableLogging Set this to enable logging
 * @param {Integer} allowedTokensPerInterval The number of allowed tokens a user can use (API requests) in time period
 * @param {Integer} intervalThreshold The interval threshold to wait before
 * @param {String}  rateLimiterNameSpace redis namespace of the rate limiter: default: '.rate.limiter'
 * @param {Boolean} enableDailyQuota Stop the API requests if we hit the DailyQuota Limit
 * @param {Integer} dailyLimit The daily limit per user for requests: ex: 5000
 * @param {Integer} globalDailyLimit The number of global requests the system can have daily: ex: 50,000
 * @param {Boolean} enableLogging Turn logging off or on
 *
 */

var RateLimiter = function (redis, enableLogging = false, allowedTokensPerInterval = 10, intervalThreshold = 1,
                            rateLimiterNameSpace = '.rate.limiter', enableDailyQuota = false,
                            dailyLimit = 0, globalDailyLimit = 0) {
   // Redis connection that is setup correctly
   this.redis = redis;
   // This is the number of tokens allowed per interval: ex: 10 tokens per interval
   this.allowedTokensPerInterval = allowedTokensPerInterval;
   // This is the interval Threshold length. ex: 1 sec. Redis uses units of seconds
   this.intervalThreshold = intervalThreshold;
   // This is the interval Threshold length. ex: 1 sec. Redis uses units of seconds
   this.enableDailyQuota = enableDailyQuota
   // Daily Limit for API calls per user; Ex 5000 API calls
   this.dailyLimit = dailyLimit;
   // The global daily limit is the number of global daily limits
   this.globalDailyLimit = globalDailyLimit;
   // Convert this into units MS (JS uses MS) Ex: 1000
   this.intervalThresholdMS = intervalThreshold * 1000;
   // Namespace for the rate limiter. ex: '.<company-name>.rate.limiter'
   this.rateLimiterNameSpace = rateLimiterNameSpace;
   // Enable logging for this library
   this.enableLogging = enableLogging;
};

RateLimiter.prototype = {
   rateLimitFunction: function (userID, callback) {
      this.rateLimit(userID, callback);
      return;
   },
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
    rateLimit: function(userID, callback) {
      const luaScript = `local key = KEYS[1]
      local duration = ARGV[1]
      local limit = ARGV[2]
      local count = redis.call('INCR', key)
      if tonumber(count) > tonumber(limit) then
        return count
      end
      redis.call('EXPIRE', key, duration)
      return 0`
      this.redis.eval(luaScript, 1, userID + this.rateLimiterNameSpace, this.intervalThreshold, this.allowedTokensPerInterval, (e, o) => {
        if(e){
          if(this.enableLogging){
            console.log("Lua error in Rate Limiter: ", e);
          }
        }
        else if (o > this.intervalThreshold) {
          if(this.enableLogging){
            console.log('Do Rate limiting,', o, 'requests in last', this.intervalThreshold, 'seconds')
          }
          setTimeout(() => {
            this.rateLimit(userID, callback);
          }, this.intervalThresholdMS)
        } else {
          callback(false)
        }
      })
    }
}

module.exports = RateLimiter;
