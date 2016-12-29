# Scalable Rate Limiter

[![Build Status](https://travis-ci.org/metricstory/scalable-rate-limiter.svg?branch=master)](https://travis-ci.org/metricstory/scalable-rate-limiter)

A professional quality rate limiter that horizontally scales with Redis and eliminates race conditions

### Prerequisites

Redis needs to be required in and setup to use the correct host and credentials.
https://www.npmjs.com/package/redis

```
npm install redis
```

### Installing

To install the library from NPM:

```
npm install scalable-rate-limiter
```

To instantiate the rate limiter and call it for API requests
```javascript
/*
* @param {Object} redis The preconfigured redis connection
* @param {Boolean} enableLogging Set this to enable logging
* @param {Integer} allowedReqsPerInterval The number of allowed tokens a user can use (API requests) in time period
* @param {Integer} intervalThreshold The interval threshold to wait before
* @param {String}  rateLimiterNameSpace redis namespace of the rate limiter: default: '.rate.limiter'
* @param {Integer} allowedReqsPerDay The number of allowed requests a user can make in one day
* @param {Integer} dailyTTL How long to store daily quota usage in redis
* @param {String} timezone Timezone for daily tally
*/
let redis = require("redis"),
    redisClient = redis.createClient(),
    limiter = new RateLimiter(redisClient, false, 5, 3, '.rate.limiter');
```

To use the rate limiter:
```javascript
// To call the rate limiter on a userID for API requests
limiter.rateLimitFunction(userID, (limited) => {
  if(!limited){
    // Make API call request for the user here
    apiCall()
  }
})
```

## Contributing

This is licensed under MIT. Please feel free to make pull requests for main features
under this license.

Wish list:

```
1) Allow the rate limiter to have multiple limits or thresholds
2) Use options object to simulate named parameters
```

## Authors

* [willyschu](https://github.com/willyschu)
* [nutterbrand](https://github.com/nutterbrand)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* willyschu for implementing the LUA rate limiter
