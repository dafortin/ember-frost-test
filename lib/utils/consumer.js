module.exports = {
  getPackages: function (options) {
    return options.project.pkg.devDependencies
  }
}
