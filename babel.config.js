module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // If you later add Reanimated, put it LAST: 'react-native-reanimated/plugin'
    ],
  };
};