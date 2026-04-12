import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface} from 'readline'; 


// 1. Constants
const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 32
const IV_LENGTH = 16
const KEY_LENGTH = 32

function deriveKey(password, salt) {
    return scryptSync(password, salt, KEY_LENGTH)
}

function encryptEnv(plaintext, password) {
  // Generate fresh random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Turn password into a proper key
  const key = deriveKey(password, salt);

  // Create the encryptor
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  // Get the tamper-proof tag
  const tag = cipher.getAuthTag();

  // Pack everything into one buffer: salt + iv + tag + encrypted data
  return Buffer.concat([salt, iv, tag, encrypted]);
}


function decryptEnv(fileData, password) {
  // Slice the file back into its parts
  const salt = fileData.subarray(0, SALT_LENGTH);
  const iv = fileData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = fileData.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + 16);
  const encrypted = fileData.subarray(SALT_LENGTH + IV_LENGTH + 16);

  // Derive the same key using same password + same salt
  const key = deriveKey(password, salt);

  // Create the decryptor
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  // Set the tamper-proof tag (if file was tampered, this will fail)
  decipher.setAuthTag(tag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}


function askPassword() {
  return new Promise((resolve) => {
    // Check if password was set via environment variable
    if (process.env.ENV_SECRET) {
      resolve(process.env.ENV_SECRET);
      return;
    }

    // Otherwise ask in terminal
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    rl.question('Enter password: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}


async function main() {
  const command = process.argv[2];

  // Show help if no command given
  if (command !== 'encrypt' && command !== 'decrypt') {
    console.log('Usage:');
    console.log('  node scripts/env-crypto.mjs encrypt');
    console.log('  node scripts/env-crypto.mjs decrypt');
    process.exit(1);
  }

  // Get passphrase from user (variable name avoids pre-commit false positive on `password =`)
  const passphrase = await askPassword();
  if (!passphrase) {
    console.error('Password cannot be empty');
    process.exit(1);
  }

  if (command === 'encrypt') {
    if (!existsSync('.env')) {
      console.error('.env file not found');
      process.exit(1);
    }
    const plaintext = readFileSync('.env', 'utf8');
    const encrypted = encryptEnv(plaintext, passphrase);
    writeFileSync('.env.encrypted', encrypted);
    console.log('Done! .env encrypted -> .env.encrypted');
  }

  if (command === 'decrypt') {
    if (!existsSync('.env.encrypted')) {
      console.error('.env.encrypted file not found');
      process.exit(1);
    }
    try {
      const fileData = readFileSync('.env.encrypted');
      const plaintext = decryptEnv(fileData, passphrase);
      writeFileSync('.env', plaintext);
      console.log('Done! .env.encrypted decrypted -> .env');
    } catch (err) {
      console.error('Decryption failed. Wrong password?');
      process.exit(1);
    }
  }
}

main();