export const RedisKeys = {
  loginAttempts: (userId: string) => `login:attempts:${userId}`,
  rateLimit: (ip: string) => `ratelimit:${ip}`,

  usersList: (query: any)=>{
    const {limit, cursor, orderBy, search, role, startDate, endDate} = query;
    return `user:list:limit=${limit || 10}:cursor=${cursor || '0'}:orderBy=${orderBy || 'asc'}`;
  }
};
