module.exports = {
    roots: ['<rootDir>/src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules'],
    setupFiles: ['dotenv/config'],
    verbose: true,
    // collectCoverage: true,
    // coverageThreshold: {
    //   global: {
    //     branches: 25,
    //     functions: 25,
    //     lines: 25,
    //     statements: 25,
    //   },
    // },
    collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**', '!**/vendor/**'],
    coveragePathIgnorePatterns: ['/node_modules'],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
