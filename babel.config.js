module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // If you use Reanimated later, add 'react-native-reanimated/plugin' LAST
  };
};