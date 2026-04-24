import path from 'node:path';

import { EligibilityService } from './eligibility.service';

const cartFile = process.argv[2];
const criteriaFile = process.argv[3];

if (!cartFile || !criteriaFile) {
  console.error('Missing cart file.');
  console.error('Usage: node index.js [CART_FILE] [PROFILE_FILE]');
  process.exit(1);
}

const cart = loadJsonFile(cartFile, 'Invalid cart file.', 2);
const criteria = loadJsonFile(criteriaFile, 'Invalid criteria file.', 3);

const eligibilityService = new EligibilityService();
const isEligible = eligibilityService.isEligible(cart, criteria);

console.log(`Cart Eligibility: ${isEligible}`);

function loadJsonFile(filePath: string, errorMessage: string, exitCode: number): unknown {
  try {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(resolvedPath);
  } catch (err) {
    console.error(errorMessage);
    console.error('Usage: node index.js [CART_FILE] [PROFILE_FILE]');
    process.exit(exitCode);
  }
}
