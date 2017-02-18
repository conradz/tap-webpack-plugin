var tapOut = require('tap-out')
var runParallel = require('run-parallel')
var execSpawn = require('execspawn')
var spawn = require('child_process').spawn

function TapWebpackPlugin (options) {
  this.options = options || {}
}

TapWebpackPlugin.prototype.apply = function (compiler) {
  compiler.plugin('after-emit', run.bind(null, this.options))
}

function run (options, compilation, callback) {
  var entry = compilation.chunks.filter((c) => c.hasRuntime())
  var files = entry.map((c) => c.files[0])
  var assets = files.map((f) => compilation.assets[f])
  var source = assets.map((a) => a.source()).join('\n')

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
        results.fail.map(getError).forEach(addError)
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
