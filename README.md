# tap-webpack-plugin

Run TAP tests on every compile with webpack

This is a plugin for [webpack](https://webpack.github.io/) that runs the
generated output bundle with Node.js and parses the output as
[TAP](https://testanything.org/). This works well with `webpack --watch` as it
will run your tests every time a file changes.

Note: You should use the `target: 'node'` option in your webpack configuration
as the generated output will be run with Node.js.

## Example

```js
// Your webpack.config.js
var TapWebpackPlugin = require('tap-webpack-plugin')

module.exports = {
  target: 'node',

  entry: ['./test'],

  output: {
    path: 'output',
    filename: 'test.js'
  },

  plugins: [
    new TapWebpackPlugin()
  ]
}
```

```js
// test.js
var test = require('tape')

test('successful test', function (t) {
  t.equal(1, 1)
  t.end()
})
```

## Example App

You can also generate your main application bundle and a test bundle by
exporting an array of configuration objects in the `webpack.config.js`:

```js
// Your webpack.config.js
var TapWebpackPlugin = require('tap-webpack-plugin')

module.exports = [
  // main bundle configuration
  {
    entry: ['./main'],
    output: {
      path: 'output/dist',
      filename: 'main.js'
    }
  },

  // test bundle configuration
  {
    target: 'node',

    entry: ['./test'],

    output: {
      path: 'output',
      filename: 'test.js'
    },

    plugins: [
      new TapWebpackPlugin()
    ]
  }
];
```

Then run `webpack` just like normal and your main bundle will be generated and
your tests will be compiled and run, all in one command!
