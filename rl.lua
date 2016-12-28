local secondsKey = KEYS[1]
local dailyKey = KEYS[2]
local duration = ARGV[1]
local secondsLimit = tonumber(ARGV[2])
local dailyLimit = tonumber(ARGV[3])
local dailyTTL = ARGV[4]
local secondsCount = tonumber(redis.call('INCR', secondsKey))
if secondsCount > secondsLimit then
  return secondsCount
end
redis.call('EXPIRE', secondsKey, duration)

if dailyLimit > 0 then
  local dailyCount = tonumber(redis.call('INCR', dailyKey))
  redis.call('EXPIRE', dailyKey, dailyTTL)
  if dailyCount > dailyLimit then
    return -1
  end
end

return 0
