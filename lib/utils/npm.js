'use strict'

var Promise = require('promise')
var chalk = require('chalk')
var exec = require('child-process-promise').exec

module.exports = {
  /**
   * Run an npm command.
   * @param {String} command the name of the npm command (view, install, unistall, etc.)
   * @param {Array} args a list of arguments
   * @returns {Promise} a promise that will return the command result once it's run
   */
  _run: function (command, args) {
    return exec(`npm ${[command].concat(args).join(' ')}`)
  },

  /**
   * Run a view command on a package
   * @param {String} pkg the package name
   * @param {Array} params extra parameters to pass to the view command
   * @returns {Promise} a promise that will return the package information and the result
   */
  view: function (pkg, params = []) {
    return this._run('view', [pkg.name, '--json'].concat(params))
      .then(function (result) {
        return new Promise(function (resolve, reject) {
          resolve({
            pkg,
            result: JSON.parse(result.stdout.toString()) || []
          })
        })
      })
  },

  /**
   * Get the available versions of a package.
   * @param {String} pkg the package name
   * @returns {Promise} a promise that will return the package information and the result
   */
  getVersions: function (pkg) {
    return this.view(pkg, ['versions'])
  },

  // TODO: comment
  install: function (pkgs) {
    const pkgsToStr = pkgs.map(pkg => `${pkg.name}@${pkg.target}`)
    console.log(chalk.green('Installing packages') + ` ${pkgsToStr.join(', ')}`)
    return this._run('install', ['--save-dev'].concat(pkgsToStr))
  }
}
