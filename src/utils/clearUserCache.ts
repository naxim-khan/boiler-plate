import redis from "../config/redis"; 

export const clearUserListCache = async () => {
  return new Promise<void>((resolve, reject) => {
    const stream = redis.scanStream({ match: "user:list*" });

    stream.on("data", (keys: string[]) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        pipeline.exec();
      }
    });

    stream.on("end", () => resolve());
    stream.on("error", (err) => reject(err));
  });
};
