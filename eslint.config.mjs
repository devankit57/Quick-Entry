import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Disable specific ESLint rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable the rule for using `any` type
      "no-console": "off", // Disable no-console rule (if needed)
      // Add other rules to disable here
    },
  },
];

export default eslintConfig;
