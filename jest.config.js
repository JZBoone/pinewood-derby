import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
const customJestConfig = {
  // 1. Setup test environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',

  // 2. Official ts-jest ESM configuration
  // We use the specific preset for ESM support
  preset: 'ts-jest/presets/default-esm', 
  
  // 3. Force these extensions to be treated as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // 4. Manual Transform Override
  // This tells Jest: "Don't let Next.js compile TS files. Let ts-jest do it with ESM enabled."
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  // 5. Handle module mapping
  // ESM requires explicit file extensions. This maps imports like './utils.js' back to './utils.ts'
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // 6. Prisma 7 Specific Fix
  // Even with experimental-vm-modules, we sometimes need to explicitly exclude Prisma 
  // from being ignored if it's strictly importing Wasm.
  // However, try running WITHOUT this first. If it fails, uncomment the lines below.
  // transformIgnorePatterns: [
  //   'node_modules/(?!@prisma/client)',
  // ],
};

export default createJestConfig(customJestConfig);