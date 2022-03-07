const path = require('path')
const glob = require('glob')
const fs = require('fs')
const chalk = require('chalk')

const error = chalk.bold.red

const isFileExist = filePath => fs.existsSync(filePath)

const getFileExt = filePath => path.extname(filePath)

const getBaseName = filePath => {
  const ext = getFileExt(filePath)
  return path.basename(filePath, ext)
}

const load = function (path) {
  if (require.resolve(path)) {
    delete require.cache[require.resolve(path)]
    return require(path)
  }
}

const getFileMap = mockPath => {
  const mockPaths = path.join(path.resolve(mockPath), '**/*')
  const fileMap = {}
  const files = glob.sync(mockPaths)
  files.forEach(mockFile => {
    const stats = fs.statSync(mockFile)
    if (stats.isFile()) {
      fileMap[getBaseName(mockFile)] = mockFile
    }
  })
  return fileMap
}

const mockServer = (app, options = {}) => {
  const { watch = '/api/*', api } = options
  const mockPath = path.resolve(__dirname, 'mock')
  const apiPath = path.resolve(__dirname, api)
  let fileMap = getFileMap(mockPath)
  if (!isFileExist(mockPath)) {
    console.log('')
    console.log(error('error: mock folder is required'))
    process.exit(0)
  }
  app.all(watch, (req, res) => {
    const url = req.path
    let mockUrl = getMockUrlMap(apiPath)[url]
    const mockFileName = getBaseName(mockUrl)
    // 新增mock文件
    if (!fileMap[mockFileName]) {
      fileMap = getFileMap(mockPath)
    }
    if (getFileExt(fileMap[mockFileName]) === '.json') {
      res.json(load(fileMap[mockFileName]))
    } else {
      load(fileMap[mockFileName])(req, res)
    }
  })
}

const getMockUrlMap = apiPath => {
  const api = load(apiPath)
  return Object.keys(api).reduce((prev, next) => {
    const urlPath = api[next]
    prev[urlPath] = path.resolve(__dirname, './mock/', next)
    return prev
  }, {})
}

module.exports = mockServer
