const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      },
      parserOptions: {
        ecmaVersion: "latest"
      }
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }]
    }
  }
];
