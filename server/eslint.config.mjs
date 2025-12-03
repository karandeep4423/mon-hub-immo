import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Temporarily ignore adminController.ts - needs refactoring
	{ ignores: ['src/controllers/adminController.ts'] },
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{
		languageOptions: { globals: globals.node },
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
