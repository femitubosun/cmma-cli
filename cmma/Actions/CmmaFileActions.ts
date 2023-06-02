import {
  ensureDirSync,
  ensureFileSync,
  outputFileSync,
  pathExistsSync,
  readFileSync,
  writeFileSync,
} from 'fs-extra'
import prettier from 'prettier'
import { join } from 'path'
import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaNodePath from '../Models/CmmaNodePath'
import FileHound from 'filehound'

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
   * @param path
   */
  public static ensureAFileExists(path: string) {
    ensureFileSync(path)
  }

  /**
   * @description Ensure a directory Exists
   * @author FATE
   * @param {} path
   */
  public static ensureADirectoryExits(path: string) {
    ensureDirSync(path)
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
   * @param path
   */
  public static getConfigurationObjectFromFilePath(path: string): CmmaConfiguration {
    return JSON.parse(readFileSync(path).toString())
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
  public static async listFilesInDir(dirPath: string) {
    return FileHound.create().path(dirPath).depth(0).find()
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
    return FileHound.create().path(dirPath).ext(extension).depth(0).find()
  }

  /**
   * @description
   * @author FATE
   * @param path
   */
  public static listSubDirsInDir(path) {
    return FileHound.create().path(path).directory().depth(1).find()
  }
}
