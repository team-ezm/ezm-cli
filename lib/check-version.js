const semver = require('semver')
const chalk = require('chalk')
const packageConfig = require('../package.json')
const requiredVersion = packageConfig.engines.node

module.exports = () => {
    // Ensure minimum supported node version is used
    if (!semver.satisfies(process.version, requiredVersion, { includePrerelease: true})) {
        console.log(chalk.red(
            'You are using Node ' + process.version + ', but this version of emo-cli requires Node ' + requiredVersion + '.\nPlease upgrade your Node version.'
        ))
        process.exit(1)
    }
}
