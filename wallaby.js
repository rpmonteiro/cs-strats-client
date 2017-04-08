module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js*',
      {pattern: 'src/**/__tests__/*-test.js', ignore: true},
      {pattern: 'src-le/__tests__/*', ignore: true},
      {pattern: 'src/images/*', ignore: true}
    ],

    tests: [
      'src/**/__tests__/*-test.js',
    ],

    compilers: {
      '**/*.js*': wallaby.compilers.babel()
    },
    
    env: {
      type: 'node',

      params: {
        env: 'LOCAL_PATH=' + process.cwd()
      }
    },

    testFramework: 'mocha',
    
    setup: function () {
      require.extensions['.jsx'] = require.extensions['.js'];
      require('./src/__tests__/setup');
      require('./src/__tests__/helpers');
    }
  };
};
