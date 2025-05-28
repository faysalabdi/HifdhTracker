module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            'src': './src',
            'ws': './src/utils/websocket-mock.js'
          },
        },
      ],
    ],
  };
}; 