const chalk = require('chalk')
const { clearConsole } = require('./clearConsole')

module.exports = async function info() {

    await clearConsole(true)

    console.log(chalk.bold('Environment Info:'))
    require('envinfo').run(
        {
            System: ['OS', 'CPU'],
            Binaries: ['Node', 'npm', 'Yarn'],
            Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
            npmGlobalPackages: ['emo-cli']
        },
        {
            showNotFound: true,
            duplicates: true,
            fullTree: true
        }
    ).then(console.log)
}


