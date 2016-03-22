var tapOut = require('tap-out')
var runParallel = require('run-parallel')
var execSpawn = require('execspawn')
var spawn = require('child_process').spawn
var map = require('lodash/collection/map')
var filter = require('lodash/collection/filter')
var forEach = require('lodash/collection/forEach')

function TapWebpackPlugin (options) {
  this.options = options || {}
}

TapWebpackPlugin.prototype.apply = function (compiler) {
  compiler.plugin('after-emit', run.bind(null, this.options))
}

function run (options, compilation, callback) {
  var entry = filter(compilation.chunks, 'entry')
  var files = map(entry, function (c) { return c.files[0] })
  var assets = map(files, function (f) { return compilation.assets[f] })
  var source = map(assets, function (a) { return a.source() }).join('\n')

  var proc = spawn(process.execPath, { stdio: ['pipe', 'pipe', 'inherit'] })
  proc.stdin.end(source, 'utf8')
  return runParallel([
    options.reporter ? report : parse,
    exit
  ], callback)

  function report (callback) {
    var reporter = execSpawn(options.reporter,
      { stdio: ['pipe', 'inherit', 'inherit'] })
    proc.stdout.pipe(reporter.stdin)
    reporter.on('exit', exited)

    function exited (code) {
      if (code !== 0) addError('test reporter non-zero exit code')
      return callback()
    }
  }

  function parse (callback) {
    proc.stdout.pipe(tapOut(parsed))

    function parsed (err, results) {
      if (err) {
        addError('could not parse TAP output')
      } else if (results.fail.length > 0) {
        forEach(map(results.fail, getError), addError)
      }
      return callback()

      function getError (f) {
        return getMessage(results.tests[f.test - 1], f)
      }
    }
  }

  function exit (callback) {
    proc.on('exit', exited)

    function exited (code) {
      if (code !== 0) addError('tests failed')
      return callback()
    }
  }

  function addError (message) {
    compilation.errors.push(new Error(message))
  }
}

function getMessage (test, fail) {
  var name = test ? test.name + ' - ' + fail.name : fail.name
  var message = 'failed test: ' + name

  var error = fail.error
  if (error && error.expected && error.actual) {
    message += '\n  Expected: ' + error.expected +
      '\n  Actual: ' + error.actual
  }

  return message
}

module.exports = TapWebpackPlugin
