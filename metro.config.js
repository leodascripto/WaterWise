const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Adiciona suporte para arquivos .cjs
defaultConfig.resolver.sourceExts.push('cjs');

// Desabilita package exports para evitar problemas com Firebase e outras libs
defaultConfig.resolver.unstable_enablePackageExports = false;

// Configurações adicionais para melhor compatibilidade
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  ext => ext !== 'svg'
);
defaultConfig.resolver.sourceExts.push('svg');

module.exports = defaultConfig;