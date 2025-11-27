import argon2 from "argon2";

const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = async (plainText: string): Promise<string> => {
  if (!plainText) throw new Error("Password is required");
  return argon2.hash(plainText, ARGON2_CONFIG);
};

export const verifyPassword = async (plainText: string, hashed: string): Promise<boolean> => {
  if (!plainText || !hashed) return false;
  return argon2.verify(hashed, plainText);
};
