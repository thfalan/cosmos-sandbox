import { toWords, encode } from 'bech32';
import * as hash from 'hash.js';

function pubkeyToAddress(pubkey: Buffer, hrp: string): string {
  // Step 1: Perform a SHA256 hash on the public key
  const sha256Digest = hash.sha256().update(pubkey).digest();

  // Step 2: Perform a RIPEMD-160 hash on the result of the SHA256 hash
  const ripemd160Digest = hash.ripemd160().update(sha256Digest).digest();

  // Step 3: Convert the result into a Bech32 encoded address
  const words = toWords(Buffer.from(ripemd160Digest));
  return encode(hrp, words);
}

// Example usage:
const pubkeyHex = "03fab3a4a22f1e6a22f90f9df3f303288b2169c70900b9bac926d815d376dd3dbd";
const pubkeyBytes = Buffer.from(pubkeyHex, 'hex');
const address = pubkeyToAddress(pubkeyBytes, 'mantra');
console.log(address);
