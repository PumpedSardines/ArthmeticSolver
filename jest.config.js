module.exports = {
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testRegex: "src/.*\\.test\\.ts$",
    testPathIgnorePatterns: ["dist"],
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!src/**/*.d.ts"],
  };
  