# Scalable Rate Limiter

A professional quality rate limiter that horizontally scales horizontally with Redis and eliminates race conditions

### Prerequisites

Redis needs to be required in and setup to use the correct host and credentials. Please
see below on how Redis is being passed in to the constructor.

### Installing

To install the library from NPM:

```
npm install scalable-rate-limiter --save
```

To instanciate the rate limiter and call it for API requests
```
/*
* @param {Object} redis The preconfigured redis connection (https://www.npmjs.com/package/redis)
* @param {Boolean} enableLogging Set this to enable logging
* @param {Integer} allowedTokensPerInterval The number of allowed tokens a user can use (API requests) in time period
* @param {Integer} intervalThreshold The interval threshold to wait before
* @param {String}  rateLimiterNameSpace redis namespace of the rate limiter: default: '.rate.limiter'
* @param {Boolean} enableDailyQuota Stop the API requests if we hit the DailyQuota Limit
* @param {Integer} dailyLimit The daily limit per user for requests: ex: 5000
* @param {Integer} globalDailyLimit The number of global requests the system can have daily: ex: 40,000
*/
let limiter = new RateLimiter(redis, false, 5, 3, '.rate.limiter', false, 5000, 40000);
```

To use the rate limiter:
```
// To call the rate limiter on a userID for API requests
limiter.rateLimitFunction(userID, (limited) => {
  if(!limited){
    // Make API call request for the user here
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
1) Implement enableDailyQuota
2) Add tests to the rate limiter
3) Allow the rate limiter to have multiple limits or thresholds
```

## Authors

* [willyschu](https://github.com/willyschu)  [nutterbrand](https://github.com/nutterbrand)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* willyschu for implementing the LUA rate limiter
