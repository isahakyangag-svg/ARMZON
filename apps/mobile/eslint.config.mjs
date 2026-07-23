import rootConfig from "../../eslint.config.mjs";

export default [
  {
    ignores: ["metro.config.js", "eslint.config.mjs"],
  },
  ...rootConfig,
];
