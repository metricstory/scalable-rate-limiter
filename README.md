# Scalable Rate Limiter

A professional quality rate limiter that horizontally scales horizontally with Redis and eliminates race conditions

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

To instanciate the rate limiter and call it for API requests
```
/*
* @param {Object} redisClient The preconfigured redis connection (https://www.npmjs.com/package/redis)
* @param {Boolean} enableLogging Set this to enable logging
* @param {Integer} allowedTokensPerInterval The number of allowed tokens a user can use (API requests) in time period
* @param {Integer} intervalThreshold The interval threshold to wait before
* @param {String}  rateLimiterNameSpace redis namespace of the rate limiter: default: '.rate.limiter'
*/
let redis = require("redis"),
    redisClient = redis.createClient(),
    limiter = new RateLimiter(redisClient, false, 5, 3, '.rate.limiter');
```

To use the rate limiter:
```
// To call the rate limiter on a userID for API requests
limiter.rateLimitFunction(userID, (limited) => {
  if(!limited){
    // Make API call request for the user here
    apiCall()
  }
})
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

We need to add tests!

### Break down into end to end tests

We need to add tests

```
Please add test examples here
```

## Contributing

This is licensed under MIT. Please feel free to make pull requests for main features
under this license.

Wish list:

```
1) Implement daily API quota check for a user
2) Add tests to the rate limiter
3) Allow the rate limiter to have multiple limits or thresholds
```

## Authors

* [willyschu](https://github.com/willyschu)  [nutterbrand](https://github.com/nutterbrand)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* willyschu for implementing the LUA rate limiter
