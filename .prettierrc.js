/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  semi: false,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'es5',
  arrowParens: 'avoid',
  endOfLine: 'auto',
  plugins: ['prettier-plugin-organize-imports'],
}
