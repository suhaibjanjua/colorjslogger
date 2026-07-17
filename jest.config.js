module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Set just below the current numbers so a real regression trips the build
  // without the thresholds needing a bump on every small change.
  coverageThreshold: {
    global: {
      statements: 88,
      branches: 80,
      functions: 100,
      lines: 88,
    },
  },
};
