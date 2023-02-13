/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        '**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    transform: {
        '^.+\\.tsx?$': ['esbuild-jest', {tsconfig: './tsconfig.json'}],
    },
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
    },
};
