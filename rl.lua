-- key for short term rate limit
local secondsKey = KEYS[1]
-- key for daily rate limit
local dailyKey = KEYS[2]
-- duration of short term limit
local duration = ARGV[1]
-- number of allowed requests in short term limit
local secondsLimit = tonumber(ARGV[2])
-- number of allowed requests in daily limit
local dailyLimit = tonumber(ARGV[3])
-- time to live for daily limits, these are kept purely for book keeping purposes
local dailyTTL = ARGV[4]
-- increment seconds counter, check count against limit, if over, return count, otherwise move on and reset expire
local secondsCount = tonumber(redis.call('INCR', secondsKey))
if secondsCount > secondsLimit then
  return secondsCount
end
redis.call('EXPIRE', secondsKey, duration)
-- if daily limit is set, increment daily counter, reset expire, and check against daily limit, if over return -1
if dailyLimit > 0 then
  local dailyCount = tonumber(redis.call('INCR', dailyKey))
  redis.call('EXPIRE', dailyKey, dailyTTL)
  if dailyCount > dailyLimit then
    return -1
  end
end
-- if not rate limited, return 0
return 0
