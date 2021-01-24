import { promises as fs } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const ignoredPaths = [
  'browserconfig.xml',
  'manifest.json',
  'robots.txt',
  'img/icons',
]

const getHash = (data: string) =>
  crypto
    .createHash('md5')
    .update(data)
    .digest('hex')

/**
 * 1. looks inside the directory
 * 2. appends hash to every file
 * 3. launches new check for every nested folder
 *
 * @param path Absolute path to directory with file
 * @param file Filename
 */
const directoryChecker = async (path: string, file: string) => {
  const absPath = join(path, file)
  if (
    ignoredPaths
      .map(ignoredName => absPath.indexOf(ignoredName) !== -1)
      .some(Boolean)
  )
    return

  if ((await fs.lstat(absPath)).isDirectory()) return directorySearcher(absPath)

  const data = await fs.readFile(absPath, { encoding: 'utf-8' })
  const hash = getHash(data).slice(0, 8)
  if (file.indexOf(hash) === -1) {
    const _splitted = file.split('.')
    _splitted.splice(_splitted.length - 1, 0, hash)
    await fs.rename(absPath, join(path, _splitted.join('.')))
  }
}

/**
 * 1. gets every file entity for path
 * 2. launches checker for it
 *
 * @param path Initial path to search
 */
const directorySearcher = async (path: string) => {
  ;(await fs.readdir(path)).forEach(file => directoryChecker(path, file))
}

const main = async () => directorySearcher(join(__dirname, '..', 'static'))

// It's not yet production ready and should not run automatically
// main()
