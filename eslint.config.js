import js from '@eslint/js';

export default [
  { ignores: ['dist', 'node_modules', 'supabase/functions'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
  },
];
