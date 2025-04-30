import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";

export default defineConfig([
  jsdoc.configs["flat/recommended-typescript-error"],
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },

    plugins: {
      jsdoc,
    },

    rules: {
      "jsdoc/no-types": 0,

      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: ["typeParam", "remarks"],
        },
      ],

      "jsdoc/tag-lines": [
        "error",
        "always",
        {
          startLines: 1,
          count: 0,
        },
      ],

      "jsdoc/sort-tags": [
        "error",
        {
          reportIntraTagGroupSpacing: false,
        },
      ],

      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,

          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },

          contexts: [
            "VariableDeclaration",
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSPropertySignature",
            "TSMethodSignature",
          ],
        },
      ],

      "jsdoc/require-param": [
        "error",
        {
          checkDestructuredRoots: false,
        },
      ],

      "jsdoc/require-description": [
        "error",
        {
          contexts: [
            "ArrowFunctionExpression",
            "ClassDeclaration",
            "ClassExpression",
            "FunctionDeclaration",
            "FunctionExpression",
            "MethodDefinition",
            "PropertyDefinition",
            "VariableDeclaration",
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSPropertySignature",
            "TSMethodSignature",
          ],
        },
      ],
    },
  },
]);
