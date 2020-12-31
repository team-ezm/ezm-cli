const {request} = require('./request')

let sessionCached

module.exports = async function getVersions () {
    if (sessionCached) {
        return sessionCached
    }

    let latest
    let error
    const local = require(`../package.json`).version
    if (process.env.EZM_CLI_TEST || process.env.EZM_CLI_DEBUG) {
        return (sessionCached = {
            current: local,
            latest: local
        })
    }

    try {
        let data = await request.get('https://registry.npmjs.org/ezm-cli')
        if (data.error) {
            error = data.error
        } else {
            latest = data['dist-tags'].latest
        }
    } catch (e) {
        error = e
    }
    return (sessionCached = {
        current: local,
        latest,
        error
    })

}
