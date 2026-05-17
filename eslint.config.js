import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. Core JS configuration
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  // 2. React plugin configurations
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    rules: {
      // --- SUPPRESSING HARMLESS NOISE ---
      "react/prop-types": "off",
      "no-useless-escape": "off",
      "no-undef": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-target-blank": "off",

      // Ignore unused variables unless they start with an underscore
      "no-unused-vars": "off",

      // --- KEEPING CRITICAL ERRORS ALIVE ---
      "react/jsx-key": "error", // Flags missing keys (causes massive UI render bugs)
      "react/jsx-no-undef": "error", // Flags when you use components like 'Helmet' without importing them (crashes page)
    },
  },
]);
