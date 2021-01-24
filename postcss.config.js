module.exports = {
  plugins: [
    require('postcss-easing-gradients'),
    require('postcss-100vh-fix'),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ],
};
