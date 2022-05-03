module.exports = {
  env: {
    "jest/globals": true
  },
  plugins: ["import"],
  extends: ["airbnb", "plugin:import/errors", "plugin:import/warnings", "prettier"],
  globals: {
    JSX: true,
    globalThis: true,
    NodeJS: true
  },
  rules: {
    camelcase: "off",
    "import/order": [
      "error",
      {
        pathGroupsExcludedImportTypes: ["builtin"],
        groups: ["builtin", "external", "internal", "parent", "object", "sibling", "index"],
        "newlines-between": "always"
      }
    ],
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/newline-after-import": ["error", { count: 1 }],
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "import/no-cycle": "warn",
    "import/export": "error",
    "import/prefer-default-export": "off",
    "import/no-duplicates": "error",
    "no-irregular-whitespace": "warn",
    "react/no-access-state-in-setstate": "warn",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "lines-between-class-members": "off",
    "no-nested-ternary": "off",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true
      }
    ],
    "no-shadow": "off",
    "no-unused-vars": "off",
    "no-array-constructor": "off",
  }
}
