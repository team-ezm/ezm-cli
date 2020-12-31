const logger = require('./logger')
const request = require('request')
const chalk = require('chalk')
const { clearConsole } = require('./clearConsole')

/**
 * List repos.
 */
module.exports = async function template () {

    await clearConsole(true)

    request({
        url: 'https://api.github.com/users/ezm-templates/repos',
        headers: {
            'User-Agent': 'ezm-cli'
        }
    }, (err, res, body) => {
        if (err) logger.fatal(err)
        const requestBody = JSON.parse(body)
        if (Array.isArray(requestBody)) {
            console.log('  Available official templates:')
            console.log()
            requestBody.forEach(repo => {
                console.log(
                    '  ' + chalk.yellow('★') +
                    '  ' + chalk.blue(repo.name) +
                    ' - ' + repo.description)
            })
        } else {
            console.error(requestBody.message)
        }
    })
}





