'use strict'

process.env.TZ = 'Asia/Shanghai'

const CronJob = require('cron').CronJob
const logger = require('./lib/logger')
const service = require('./service')

// 定义 Cron 执行频率
const CRON_TIME = '0 */5 * * * *'

let cacheGallery = async function (remotePath) {
  let data = await service.getGalleryAsync(remotePath)
  for (let item of data.data) {
    if (item.type !== 'GALLERY') {
      continue
    }
    await cacheGallery(item.path)
  }
}

let fn = function () {
  return cacheGallery('/').catch(logger.error)
}

// eslint-disable-next-line
new CronJob({
  cronTime: CRON_TIME,
  onTick: fn,
  start: true,
  runOnInit: true
})