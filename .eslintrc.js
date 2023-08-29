module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  globals: {
    module: true,
    window: true,
    location: true,
    document: true,
    localStorage: true,
    FormData: true,
    FileReader: true,
    Blob: true,
    navigator: true,
    process: true,
  },
  env: {
    jest: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript",
    "plugin:import/typescript",
    "plugin:import/warnings",
    "plugin:import/errors",
  ],
  plugins: ["@typescript-eslint", "import", "import-newlines"],
  rules: {
    /* Common rules */
    "consistent-return": "warn", // TODO
    "default-case": 0,
    "import/no-named-as-default": "warn", // TODO
    "import/prefer-default-export": 0,
    "import-newlines/enforce": [
      "error",
      {
        "max-len": 120,
        semi: true,
        forceSingleLine: false,
      },
    ],
    "no-continue": 0,
    "no-param-reassign": "warn", // TODO
    "no-plusplus": 0,
    "no-console": "warn", // TODO
    "no-restricted-exports": "warn", // TODO
    "no-return-assign": "warn", // TODO
    "no-alert": "warn", // TODO
    "no-restricted-syntax": "warn", // TODO
    "max-len": ["warn", { code: 120 }], // TODO
    "import/no-extraneous-dependencies": "warn", // TODO
    "padding-line-between-statements": ["error",
      { blankLine: "always", prev: "*", next: "return" }],
    semi: ["warn", "always"],

    /* Typescript rules */
    "@typescript-eslint/consistent-type-exports": [
      "warn", { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn", // TODO
    "@typescript-eslint/naming-convention": "warn", // TODO
    "@typescript-eslint/no-use-before-define": "warn", // TODO
    "@typescript-eslint/no-shadow": "warn", // TODO
    "@typescript-eslint/default-param-last": "warn", // TODO
    "@typescript-eslint/no-unused-vars": "warn", // TODO
    "@typescript-eslint/no-redeclare": "warn", // TODO
    "@typescript-eslint/quotes": ["error", "double"],

    "no-underscore-dangle": 0,
    "@typescript-eslint/semi": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
      },
    ],
    "import/no-cycle": [2, { ignoreExternal: true }],
    "import/default": 0,
    "import/named": 0,
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "type",
          ["parent", "sibling"],
          "index",
        ],
        "newlines-between": "always",
        pathGroups: [
          {
            pattern: "*.css",
            group: "index",
            patternOptions: {
              matchBase: true,
            },
            position: "after",
          },
          {
            pattern: "*type*.ts",
            group: "type",
          },
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        warnOnUnassignedImports: true,
      },
    ],
    "react/jsx-filename-extension": 0,
    "class-methods-use-this": 0,
    "no-new": 0,
  },
  settings: {
    "import/ignore:": [
      "node_modules",
    ],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".tsx"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  overrides: [
    {
      files: [
        "*.ts",
      ],
      rules: {
        "no-undef": "off",
      },
    },
    {
      files: "**/*.d.ts",
      rules: {
        "no-unused-vars": 0,
        "@typescript-eslint/triple-slash-reference": 0,
      },
    },
    {
      files: "webpack**",
      rules: {
        "@typescript-eslint/no-var-requires": 0,
      },
    },
  ],
};
