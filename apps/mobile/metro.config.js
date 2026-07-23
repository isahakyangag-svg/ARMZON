/* eslint-disable */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native" ||
    moduleName.startsWith("react-native/")
  ) {
    return {
      filePath: require.resolve(moduleName, {
        paths: [path.resolve(projectRoot, "node_modules")],
      }),
      type: "sourceFile",
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
