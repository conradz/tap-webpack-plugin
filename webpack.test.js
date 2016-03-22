var TapWebpackPlugin = require('./')

module.exports = {
  target: 'node',
  entry: ['./test'],

  output: {
    path: 'output',
    filename: 'test.js'
  },

  plugins: [
    new TapWebpackPlugin(),
    new TapWebpackPlugin({ reporter: 'tap-spec' })
  ]
}
