# Project Title

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
// To initial the rate limiter when the app initializes:
// Argument 1: redis -- The configured redis client for node (ex: var redis = require("redis") )
// false: Do not enable logging
// 5: Five tokens allowed for a user in an interval
// 3: The length of the interval in seconds
// '.rate.limiter': The namespace the limiter will use in redis. Ex: userID.rate.limiter
// false: Disable the check for stopping API requests once the daily quota is reached
// 5000: The daily API limit for a userID
// 40000: The global daily limit for every user
let limiter = new RateLimiter(redis, false, 5, 3, '.rate.limiter', false, 5000, 40000);


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

## Authors

* [willyschu](https://github.com/willyschu)  [nutterbrand](https://github.com/nutterbrand)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* willyschu for implementing the LUA rate limiter
