/**
 * Install blueprint for ember-frost-test addon
 */

var npm = require('ember-frost-test/lib/utils/npm')
var consumer = require('ember-frost-test/lib/utils/consumer')
var packageHandler = require('ember-frost-test/lib/utils/package-handler')
var Promise = require('bluebird')
var chalk = require('chalk')
var cpExec = require('child_process').exec
var fsReadFile = require('fs').readFile
var fsWriteFile = require('fs').writeFile
var EOL = require('os').EOL
var path = require('path')

var exec = Promise.promisify(cpExec)
var readFile = Promise.promisify(fsReadFile)
var writeFile = Promise.promisify(fsWriteFile)

module.exports = {
  /**
   * Add sinon-chai and chai-jquery bower libraries during testing
   * @returns {Promise} a promise when the `ember-cli-build.js` file has been updated
   */
  removeLoadingOfTestHelpers: function () {
    this.ui.writeLine(chalk.red('Reverting') + ' "ember-cli-build.js" to not load "sinon-chai" and "chai-jquery"')
    const snippet =
      '  if ([\'test\', \'development\'].includes(app.env)) {' + EOL +
      '    ;[' + EOL +
      '      \'bower_components/sinon-chai/lib/sinon-chai.js\',' + EOL +
      '      \'bower_components/chai-jquery/chai-jquery.js\'' + EOL +
      '    ].forEach((path) => {' + EOL +
      '      app.import(path)' + EOL +
      '    })' + EOL +
      '  }' + EOL

    const filePath = path.join(this.project.root, 'ember-cli-build.js')
    return readFile(filePath, 'utf8')
      .then((contents) => {
        return writeFile(filePath, contents.replace(snippet, ''))
      })
  },

  removeBowerPackagesFromProject: function (bowerPackagesToRemove) {
    this.ui.writeLine(chalk.red('Removing') + ' "sinon-chai" and "chai-jquery" from bower.')
    const pkgList = bowerPackagesToRemove.map(pkg => pkg.name).join(' ')
    return exec(`bower uninstall --save ${pkgList}`)
  },

  /*
   * No idea why, but the default addPackagesToProject is installing the packages, but not updating
   * package.json, so this is a temporary fix for that.
   */
  addPackagesToProject: function (packagesToAdd) {
    return npm.install(packagesToAdd)
  },

  afterInstall: function (options) {
    const bowerPackagesToRemove = [
      {name: 'sinon-chai'},
      {name: 'chai-jquery'}
    ]

    const addonsToAdd = [
      {name: 'ember-cli-mocha', target: '^0.13.0'},
      {name: 'ember-hook', target: '^1.3.5'},
      {name: 'ember-sinon', target: '^0.6.0'},
      {name: 'ember-test-utils', target: '^1.3.2'}
    ]

    const packagesToAdd = [
      {name: 'sinon-chai', target: '^2.8.0'},
      {name: 'chai-jquery', target: '^2.0.0'}
    ]

    const consumerPackages = consumer.getPackages(options)

    return this.removeBowerPackagesFromProject(bowerPackagesToRemove)
      .then(() => {
        return this.removeLoadingOfTestHelpers()
      })
      .then(() => {
        return packageHandler.getPkgsToInstall(addonsToAdd, consumerPackages).then((pkgsToInstall) => {
          if (pkgsToInstall.length !== 0) {
            return this.addAddonsToProject({packages: pkgsToInstall})
          }
        })
      })
      .then(() => {
        return packageHandler.getPkgsToInstall(packagesToAdd, consumerPackages).then((pkgsToInstall) => {
          if (pkgsToInstall.length !== 0) {
            return this.addPackagesToProject(pkgsToInstall)
          }
        })
      })
  },

  normalizeEntityName: function () {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter to us)
  }
}
