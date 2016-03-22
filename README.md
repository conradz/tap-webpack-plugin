# tap-webpack-plugin

[![travis][travis-image]][travis-url]
[![js-standard-style][standard-image]][standard-url]
[![npm][npm-image]][npm-url]

Run TAP tests on every compile with webpack

This is a plugin for [webpack][webpack-url] that runs the generated output
bundle with Node.js and parses the output as [TAP][tap-url]. This works well
with `webpack --watch` as it will run your tests every time a file changes.

Note: You should use the `target: 'node'` option in your webpack configuration
as the generated output will be run with Node.js.

## Using a TAP Reporter

By default this plugin will parse the TAP output and report any errors from the
TAP output to webpack. If instead you want to pass the TAP output to a
[TAP reporter][reporters], just use the `reporter` option, like this:

```js
new TapWebpackPlugin({ reporter: 'tap-spec' })
```

The `reporter` option specifies the command line for the reporter. It will be
run in a shell, so you can pass arguments such as `'tap-spec --no-color'`.
Output from the TAP reporter will be written directly to the stdout of the
webpack process. If the TAP reporter command exits with a non-zero exit code,
the plugin will report an error to webpack.

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
    new TapWebpackPlugin(),

    // or with a reporter:
    new TapWebpackPlugin({ reporter: 'tap-spec' })
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

[travis-image]: https://img.shields.io/travis/conradz/tap-webpack-plugin.svg?style=flat
[travis-url]: https://travis-ci.org/conradz/tap-webpack-plugin
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat
[standard-url]: https://github.com/feross/standard
[npm-image]: https://img.shields.io/npm/v/tap-webpack-plugin.svg?style=flat
[npm-url]: https://npmjs.org/package/tap-webpack-plugin
[webpack-url]: https://webpack.github.io/
[tap-url]: https://testanything.org/
[reporters]: https://github.com/sindresorhus/awesome-tap#reporters
