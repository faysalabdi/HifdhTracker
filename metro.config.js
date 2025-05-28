const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Metro configuration from Expo
const defaultConfig = getDefaultConfig(__dirname);

// Configure specific module resolutions
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'cjs', 'mjs'];

// Add support for .node files if needed
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts || [];
defaultConfig.resolver.assetExts.push('node');

module.exports = defaultConfig; 