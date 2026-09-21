import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Standard "fetch on mount, then setState" is the normal data-fetching
      // pattern used throughout this app and is not a bug.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // shadcn-style ui primitives intentionally co-export a component and its
    // cva() variants (e.g. Button + buttonVariants) from the same file.
    files: ['src/components/ui/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])