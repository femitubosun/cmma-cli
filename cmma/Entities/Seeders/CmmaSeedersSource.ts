import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { FileNode } from '@ioc:Adonis/Lucid/Database'
import { sourceFiles } from '../../Helpers/LucidCommandsUtils'
import CmmaConfiguration from '../../Models/CmmaConfiguration'
import CmmaNodePathActions from '../../Actions/CmmaNodePathActions'

/**
 * Seeders source exposes the API to read the seeders from disk for a given connection.
 */
export class CmmaSeedersSource {
  constructor(private app: ApplicationContract, private cmmaConfigObject: CmmaConfiguration) {}

  /**
   * Returns an array of files inside a given directory. Relative
   * paths are resolved from the project root
   */
  private async getDirectoryFiles(directoryPath: string): Promise<FileNode<unknown>[]> {
    const { files } = await sourceFiles(this.app.appRoot, directoryPath, false)
    return files
  }

  /**
   * Returns an array of seeders paths for a given connection. If paths
   * are not defined, then `database/seeders` fallback is used
   */
  private getSeedersPaths(): string[] {
    /**
     * Replace default Seeders Path CMMA Seeders Paths
     */
    const seedersDirectoriesNodePath = CmmaNodePathActions.listProjectSeedersDirectoriesNodePaths(
      this.cmmaConfigObject
    )

    const directories = seedersDirectoriesNodePath.map((nodePath) => nodePath.getSeedersTypePath())
    const defaultDirectory = this.app.directoriesMap.get('seeds') || 'database/seeders'
    return directories && directories.length ? directories : [`./${defaultDirectory}`]
  }

  /**
   * Returns an array of files for the defined seed directories
   */
  public async getSeeders() {
    const seedersPaths = this.getSeedersPaths()
    const directories = await Promise.all(
      seedersPaths.map((directoryPath) => {
        return this.getDirectoryFiles(directoryPath)
      })
    )

    return directories.reduce((result, directory) => {
      result = result.concat(directory)
      return result
    }, [])
  }
}
