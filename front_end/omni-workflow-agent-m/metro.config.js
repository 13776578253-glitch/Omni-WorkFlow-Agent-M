const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('docx')) {
  config.resolver.assetExts.push('docx');
}

if (!config.resolver.assetExts.includes('pptx')) {
  config.resolver.assetExts.push('pptx');
}

module.exports = config;
