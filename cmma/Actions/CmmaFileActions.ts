import {
  ensureDirSync,
  ensureFileSync,
  outputFileSync,
  pathExistsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs-extra'
import prettier from 'prettier'
import { basename, extname, join } from 'path'
import CmmaConfiguration from '../Models/CmmaConfiguration'
import CmmaNodePath from '../Models/CmmaNodePath'

export default class CmmaFileActions {
  /**
   * @description Append Text To File
   * @param appendToFileOptions
   * @author FATE
   */
  public static appendToFile(appendToFileOptions: { filePath: string; text: string }) {
    const { filePath, text } = appendToFileOptions

    outputFileSync(filePath, text + '\n', { flag: 'a' })
  }

  /**
   * @description Ensure a file exists
   * @author FATE
   * @param filePath
   */
  public static ensureAFileExists(filePath: string) {
    ensureFileSync(filePath)
  }

  /**
   * @description Ensure a directory Exists
   * @author FATE
   * @param {} dirPath
   */
  public static ensureADirectoryExits(dirPath: string) {
    ensureDirSync(dirPath)
  }

  /**
   * @description Format file
   * @param formatFileOptions
   * @author FATE
   */
  public static formatFile(formatFileOptions: { filePath: string; parser: string }) {
    const { filePath, parser } = formatFileOptions

    const fileContents = readFileSync(filePath, 'utf8')

    const formattedCode = prettier.format(fileContents, {
      parser,
    })

    writeFileSync(filePath, formattedCode)
  }

  /**
   * @description Create a relative file Path from Node Path
   * @author FATE
   * @param createRelativeFilePathFromNodePathOptions
   */
  public static createRelativeFilePathFromNodePath(createRelativeFilePathFromNodePathOptions: {
    nodePath: CmmaNodePath
    noExt?: boolean
  }) {
    const { nodePath, noExt } = createRelativeFilePathFromNodePathOptions

    if (noExt) {
      const lastItem = nodePath.path[nodePath.path.length - 1]
      const splitItem = lastItem.split('.')
      splitItem.pop()
      nodePath[nodePath.path.length - 1] = splitItem[0]
    }

    return nodePath.path.join('/')
  }

  /**
   * @description Get an absolute Path from a Node Path
   * @param createAbsolutePathFromNodePathOptions
   * @protected
   */
  public static createAbsolutePathFromNodePath(createAbsolutePathFromNodePathOptions: {
    nodePath: CmmaNodePath
    projectRootDirInApp: string
    applicationRoot: string
  }) {
    const { nodePath, projectRootDirInApp, applicationRoot } = createAbsolutePathFromNodePathOptions

    return CmmaFileActions.joinPath([applicationRoot, 'app', projectRootDirInApp, ...nodePath.path])
  }

  /**
   * @description Make a path from Array of strings
   * @param paths
   */
  public static joinPath(paths: Array<string>) {
    return join(...paths)
  }

  /**
   * @description Does a File Path Exist?
   * @author FATE
   * @param path
   */
  public static doesPathExist(path: string) {
    return pathExistsSync(path)
  }

  /**
   * @description Get CMMA Configuration from File Path
   * @author FATE
   * @param filePath
   */
  public static getConfigurationObjectFromFilePath(filePath: string): CmmaConfiguration {
    return JSON.parse(readFileSync(filePath).toString())
  }

  public static getCmmaTemplatesDir(appRoot: string) {
    return [appRoot, 'cmma', 'Templates']
  }

  /**
   * @description Write CMMA Configuration To Configuration Object
   * @author FATE
   * @param {} writeConfigObjectToConfigFileOptions
   */
  public static writeConfigObjectToConfigFile(writeConfigObjectToConfigFileOptions: {
    configObject: CmmaConfiguration
    configFilePath: string
  }) {
    const { configFilePath, configObject } = writeConfigObjectToConfigFileOptions

    writeFileSync(configFilePath, JSON.stringify(configObject))

    this.formatFile({
      filePath: configFilePath,
      parser: 'json',
    })
  }

  /**
   * @description
   * @author FATE
   * @param dirPath
   */
  public static listFilesInDir(dirPath: string) {
    const files = readdirSync(dirPath)

    return files.filter((file) => {
      const stat = statSync(dirPath + '/' + file)
      return stat.isFile()
    })
  }

  /**
   * @description
   * @author FATE
   * @param dirPath
   * @param filesArray
   */
  public static listAllFilesInADirIncludingSubDirectories(
    dirPath: string,
    filesArray: Array<string> = []
  ) {
    const files = readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = this.joinPath([dirPath, file])
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        this.listAllFilesInADirIncludingSubDirectories(filePath, filesArray)
      } else {
        filesArray.push(basename(filePath))
      }
    })

    return filesArray
  }

  /**
   * @description List Files in a Dir without their extension
   * @author FATE
   * @param dirPath
   */
  public static listFilesInDirWithoutTheirExtensions(dirPath: string) {
    const files = readdirSync(dirPath)

    const filesWithExtensions = files.filter((file) => {
      const stat = statSync(dirPath + '/' + file)
      return stat.isFile()
    })

    return filesWithExtensions.map((file) => {
      return file.split('.')[0]
    })
  }

  /**
   * @description
   * @author FATE
   * @param {} listFilesInDirWithExtensionOptions
   */
  public static listFilesInDirWithExtension(listFilesInDirWithExtensionOptions: {
    dirPath: string
    extension: string
  }) {
    const { dirPath, extension } = listFilesInDirWithExtensionOptions
    const files = readdirSync(dirPath)

    return files.filter((file) => {
      const fileExtension = extname(file)
      return fileExtension === extension
    })
  }

  /**
   * @description
   * @author FATE
   * @param dirPath
   */
  public static listSubDirsInDir(dirPath: string) {
    const files = readdirSync(dirPath)

    return files.filter((file) => {
      const stat = statSync(dirPath + '/' + file)
      return stat.isDirectory()
    })
  }

  /**
   * @description List the Contexts Defined in Project's Root Directory
   * @author FATE
   * @param {} projectRootDir
   */
  public static listContextsOnDisk(projectRootDir: string) {
    return this.listSubDirsInDir(projectRootDir)
  }

  /**
   * @description List the Routes Files in System Route Dir
   * @author FATE
   * @param dirPath
   */
  public static listRoutesInSystemRoutesDir(dirPath: string) {
    const filesInRoutesDir = this.listFilesInDirWithoutTheirExtensions(dirPath)

    return filesInRoutesDir.filter((file) => file !== 'index')
  }
}
