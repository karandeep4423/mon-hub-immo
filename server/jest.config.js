/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/*.test.ts', '**/*.spec.ts'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.test.ts',
		'!src/**/*.spec.ts',
	],
	coverageDirectory: 'coverage',
	verbose: true,
	testTimeout: 10000,
	// Clear mocks between tests
	clearMocks: true,
	// Setup files
	setupFilesAfterEnv: [],
};
