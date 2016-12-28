local key = KEYS[1]
local duration = ARGV[1]
local limit = ARGV[2]
local count = redis.call('INCR', key)
if tonumber(count) > tonumber(limit) then
  return count
end
redis.call('EXPIRE', key, duration)
return 0
