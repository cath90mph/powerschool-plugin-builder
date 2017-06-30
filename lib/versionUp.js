'use strict'

const fs = require('fs-extra'),
      p = require('path'),
      xml = require('xml2js'),
      semver = require('semver'),
      parser = new xml.Parser(),
      builder = new xml.Builder()

module.exports = (logger, program) => {

  return new Promise((resolve, reject) => {
    if (!program.increment) {
      return resolve()
    }

    if (program.increment === true) {
      program.increment = 'patch'
    }

    const pluginXmlPath = p.join(program.source, 'plugin.xml')

    fs.readFile(pluginXmlPath, 'utf8', (err, data) => {
      let plugin = parser.parseString(data, (err, result) => {
        const nextVersion = semver.inc(result.plugin.$.version, program.increment)
        result.plugin.$.version = nextVersion

        fs.writeFile(pluginXmlPath, builder.buildObject(result), err => {
          if (err) {
            logger.error('Error writing plugin.xml with new version:', err)
            return reject('Build failed!')
          }

          logger.info(`Saved plugin.xml with plugin version ${nextVersion}`)
          resolve()
        })
      })
    })
  })

}