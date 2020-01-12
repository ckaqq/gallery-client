import hmacsha1 from 'hmacsha1'
import md5 from 'js-md5'
import upyun from 'upyun'
import axios from 'axios'
import Promise from 'bluebird'
import config from './config'

export default (password) => new Upyun(password)

class Upyun extends upyun.Client {
  constructor (password) {
    const { bucket, operator } = config.upyun
    const service = new upyun.Service(bucket, operator, password)
    super(service, getHeaderSign)
    this.password = password
  }

  async getAlbumAsync (path) {
    const { makeThumbnail } = config.upyun
    const files = await this.listDirAsync(path)
    const gallery = getAlbumInfo(path)
    await Promise.map(files, async (file, index) => {
      const filePath = pathJoin(path, file.name)
      if (file.type === 'F') {
        const album = getAlbumInfo(filePath)
        album.thumbnails = await this.getThumbnailsAsync(filePath)
        gallery.albums.push(album)
      } else {
        if (isHideFile(filePath) || !isImgFile(filePath)) {
          return
        }
        gallery.images.push({
          index: index,
          path: pathJoin(path, file.name),
          name: getNameFromPath(filePath),
          meta: await this.getMetaAsync(filePath),
          url: {
            original: this.getFileUrl(filePath),
            thumbnail: this.getFileUrl(pathJoin(filePath, makeThumbnail))
          }
        })
      }
    }, { concurrency: 5 })
    gallery.images.sort((a, b) => a.index - b.index)
    return gallery
  }

  async listDirAsync (path) {
    const options = {}
    let data = []
    do {
      const res = await this.listDir(path, options)
      data = data.concat(res.files)
      options.iter = res.next
    } while (options.iter && options.iter !== 'g2gCZAAEbmV4dGQAA2VvZg')
    return data
  }

  getFileUrl (path) {
    const { baseUrl } = config.upyun
    const token = this.password

    const etime = Math.round(Date.now() / 1000) + 1800
    const sign = md5(`${token}&${etime}&${path}`).substr(12, 8)
    const query = '?_upt=' + sign + etime

    path = path.split('/').map(encodeURIComponent).join('/')
    return baseUrl + path + query
  }

  async getMetaAsync (path) {
    const url = this.getFileUrl(path + '!/meta')
    const { data } = await axios.get(url)
    data.EXIF = data.EXIF || {}
    return data
  }

  async getThumbnailsAsync (path) {
    const { makeThumbnail } = config.upyun

    const name = getNameFromPath(path)
    if (config.thumbnails[name]) {
      return config.thumbnails[name].map((item) => this.getFileUrl(pathJoin(path, item, makeThumbnail)))
    }

    const result = []
    const { files } = await this.listDir(path)
    for (const file of files) {
      if (file.type === 'N') {
        const filePath = pathJoin(path, file.name)
        if (isHideFile(filePath) || !isImgFile(filePath)) {
          continue
        }
        result.push(this.getFileUrl(pathJoin(filePath, makeThumbnail)))
        if (result.length >= 4) {
          return result
        }
      }
    }
    return result
  }
}

function getHeaderSign (service, method, path, contentMd5 = null) {
  const date = new Date().toGMTString()
  path = '/' + service.serviceName + path

  const data = [ method, encodeURI(path), date ]
  if (contentMd5) {
    data.push(contentMd5)
  }
  const sign = hmacsha1(service.password, data.join('&'))

  return {
    'Authorization': `UPYUN ${service.operatorName}:${sign}`,
    'X-Date': date
  }
}

function getNameFromPath (path) {
  return path.split('/').pop() || path
}

function pathJoin (...paths) {
  return paths.join('/').replace(/\/{2,}/g, '/')
}

function getAlbumInfo (path) {
  return {
    path: path,
    name: getNameFromPath(path),
    questions: {},
    description: null,
    images: [],
    thumbnails: [],
    albums: []
  }
}

function isHideFile (fileName) {
  return fileName.startsWith('.')
}

function isImgFile (fileName) {
  const imgExts = ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
  let index = fileName.lastIndexOf('.')
  if (index !== -1) {
    let ext = fileName.substr(index)
    return imgExts.indexOf(ext.toLowerCase()) !== -1
  }
  return false
}
