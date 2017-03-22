module.exports = function () {
  // const map = ctx.webpack.sourceMap;
  
  return {
    plugins: {
      'postcss-import': {},
      'postcss-url': {},
      'postcss-cssnext': {
        browsers: ['last 2 versions', '> 5%']
      }
    }
  };
};
