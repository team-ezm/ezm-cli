const download = require('download-git-repo')
const path = require('path')
const fs = require('fs-extra')
const validateProjectName = require('validate-npm-package-name')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { clearConsole } = require('./clearConsole')
const logger = require('../lib/logger')
const localPath = require('../lib/local-path')
const generate = require('../lib/generate')
const home = require('user-home')
const rm = require('rimraf').sync
const ora = require('ora')

const isLocalPath = localPath.isLocalPath

async function create(projectName, options) {

    const cwd =  options.cwd || process.cwd()
    const inCurrent = !projectName || projectName === '.' // 是否在当前目录下构建项目
    const name = inCurrent ? path.relative('../', cwd) : projectName //如果在当前目录下构建项目,当前目录名为项目构建目录名，否则是当前目录下的子目录【rawName】为项目构建目录名
    const targetDir = path.resolve(cwd, projectName || '.') //项目构建目录的绝对路径

    const result = validateProjectName(name)
    if (!result.validForNewPackages) {
        logger.error(`Invalid project name: "${name}"`)
        result.errors && result.errors.forEach(err => {
            logger.error(err)
        })
        result.warnings && result.warnings.forEach(warn => {
            logger.warn(warn)
        })
        process.exit(1)
    }

    if (fs.existsSync(targetDir)) {
        if (options.force) {
            await fs.remove(targetDir)
        } else {
            // clearConsole.js
            await clearConsole()
            if (inCurrent) {
                const { ok } = await inquirer.prompt([
                    {
                        name: 'ok',
                        type: 'confirm',
                        message: `Generate project in current directory?`
                    }
                ])
                if (!ok) {
                    return
                }
            } else {
                const { action } = await inquirer.prompt([
                    {
                        name: 'action',
                        type: 'list',
                        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
                        choices: [
                            { name: 'Overwrite', value: 'overwrite' },
                            { name: 'Merge', value: 'merge' },
                            { name: 'Cancel', value: false }
                        ]
                    }
                ])
                if (!action) {
                    return
                } else if (action === 'overwrite') {
                    console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
                    console.log()
                    await fs.remove(targetDir)
                }
            }
        }
    } else {
        // clearConsole.js
        await clearConsole()
    }

    logger.log(`✨   Creating project in ${chalk.yellow(targetDir)}`)

    const template = options.template

    // check if template is local
    if (isLocalPath(template)) {    //是否是本地模板
        // logger.log('本地模板')
        // const templatePath = getTemplatePath(template)  //获取绝对路径
        // if (exists(templatePath)) {  //判断模板所在路径是否存在
        //     //渲染模板
        //     generate(name, templatePath, to, err => {
        //         if (err) logger.fatal(err)
        //         console.log()
        //         logger.success('Generated "%s".', name)
        //     })
        // } else {
        //     //打印错误日志，提示本地模板不存在
        //     logger.fatal('Local template "%s" not found.', template)
        // }
    } else {
        // use official templates
        const officialTemplate = template
        if (template.indexOf('#') !== -1) {  //模板名是否带"#"
            downloadAndGenerate(officialTemplate,targetDir,projectName) //下载模板
        } else {
            // warnings.v2BranchIsNowDefault(template, inPlace ? '' : name)
            downloadAndGenerate(officialTemplate,targetDir,projectName)//下载模板
        }
    }

}



/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 * @param {String} targetDir
 * @param {String} projectName
 */
function downloadAndGenerate (template, targetDir, projectName) {

    const tmp = path.join(home, '.emo-templates', template.replace(/[\/:]/g, '-'))

    template = 'ezm-templates/' + template + '#dev'
    const spinner = ora('🚀🚀🚀  downloading template...')
    spinner.start()
    // Remove if local template exists
    if (fs.existsSync(tmp)) rm(tmp)  //当前模板库是否存在该模板，存在就删除
    //下载模板  template-模板名    tmp- 模板路径   clone-是否采用git clone模板   err-错误短信
    download(template, tmp, err => {
        spinner.stop()
        //如果有错误，打印错误日志
        if (err) logger.error('Failed to download repo ' + template + ': ' + err.message.trim())
        logger.log('🚀  Invoking generators...')
        //渲染模板
        generate(projectName, tmp, targetDir, err => {
            if (err) logger.error(err)
        })
    })
}

module.exports = (...args) => {
    return create(...args).catch(err => {
        console.log(err)
    })
}
