import { BinaryToTextEncoding, createHash } from 'node:crypto';
import bcrypt from 'bcrypt';

interface AllowedEncodings {
  [k: string]: BinaryToTextEncoding
};

const allowedEncodings: AllowedEncodings = {
  base64: 'base64',
  base64url: 'base64url',
  hex: 'hex',
  binary: 'binary'
}

const getEncoding = (): BinaryToTextEncoding => {
  const encoding = process.env.ENCODING;
  if (!encoding) {
    throw new Error('Missing or Invalid ENCODING!');
  }
  return allowedEncodings[encoding];
};

const getHashAlgorithm = (): string => {
  const algorithm = process.env.HASH_ALGORITHM;
  if (!algorithm) {
    throw new Error("HASH_ALGORITHM is missing!")
  }
  return algorithm;
};

const getSaltRounds = (): number => {
  const rounds = Number(process.env.SALT_ROUNDS);
  if (!Number.isInteger(rounds) || rounds < 10) {
    throw new Error("Invalid SALT_ROUNDS")
  }
  return rounds;
};

async function hashPassword(password: string): Promise<string> {
  const preHashedPass = createHash(getHashAlgorithm())
    .update(password)
    .digest(getEncoding());
  return await bcrypt.hash(preHashedPass, getSaltRounds());
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const preHashed = createHash(getHashAlgorithm())
    .update(password)
    .digest(getEncoding());
  return await bcrypt.compare(preHashed, hash);
}

export {
  hashPassword,
  verifyPassword
}