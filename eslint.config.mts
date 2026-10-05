/// <reference types="node" />

import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";
import type { Linter } from "eslint";
import { fileURLToPath } from "node:url";

// This plugin exports an iterable config object, not an array; its types omit that iterator.
const recommended = obsidianmd.configs?.recommended as unknown as Iterable<Linter.Config>;

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
				extraFileExtensions: ['.json']
			},
		},
	},
	...recommended,
	{
		...tseslint.configs.disableTypeChecked,
		files: ["tests/**/*.mjs"],
		languageOptions: {
			globals: globals.node,
			parserOptions: { project: false, projectService: false },
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
