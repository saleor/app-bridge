module.exports = {
  extends: ["prettier/@typescript-eslint", "plugin:prettier/recommended"],
  plugins: ["simple-import-sort", "eslint-plugin-tsdoc"],
  rules: {
    quotes: ["off"],
    "simple-import-sort/imports": ["error"],
    "sort-imports": "off", // imports are handled by simple-import-sort/sort
    "tsdoc/syntax": "warn",
  },
};
