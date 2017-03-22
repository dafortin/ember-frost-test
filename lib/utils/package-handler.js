'use strict'

var chalk = require('chalk')
var npm = require('ember-frost-test/lib/utils/npm')
var semver = require('semver')

// TODO: add comments
module.exports = {
  getPkgsToInstall: function (pkgs, consumerPackages) {
    const packagesVersionsPromise = this._getPackagesVersions(pkgs)
    return packagesVersionsPromise.then((results) => {
      const toInstall = []
      results.forEach(({pkg, result}) => {
        if (this._isInstalled(pkg, result, consumerPackages)) {

          console.log(`${chalk.green('Installed package')} ${pkg.name}@${pkg.target}`)
        } else {
          toInstall.push(pkg)
        }
      })
      return toInstall
    })
  },

  _isInstalled: function (pkg, availablePkgVersions, consumerPackages) {
    const existingTarget = consumerPackages[pkg.name]

    if (!existingTarget) {
      return false
    }

    const existingTargetVersion = this._getTargetVersion(existingTarget, availablePkgVersions)
    const targetVersion = this._getTargetVersion(pkg.target, availablePkgVersions)

    return existingTargetVersion >= targetVersion
  },

  _getPackagesVersions: function (pkgs) {
    const promises = []
    pkgs.forEach((pkg) => {
      promises.push(npm.getVersions(pkg))
    })
    return Promise.all(promises)
  },

  _getTargetVersion (target, availablePkgVersions) {
    const validRange = semver.validRange(target)
    let version
    if (validRange) {
      version = semver.maxSatisfying(availablePkgVersions, target)
    } else {
      version = semver.valid(target)
    }

    return version
  }
}
