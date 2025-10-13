import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // Bring in Next.js and TypeScript base via FlatCompat
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    // Ported from .eslintrc.json extends
    'plugin:@next/next/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    plugins: {
      'simple-import-sort': (await import('eslint-plugin-simple-import-sort')).default,
    },
    rules: {
      'prefer-const': 'off',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],
      'import/order': [
        'off',
        {
          groups: [['builtin', 'external', 'internal']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
]

export default eslintConfig
