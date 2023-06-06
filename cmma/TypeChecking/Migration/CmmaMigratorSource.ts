import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { ConnectionConfig, FileNode } from '@ioc:Adonis/Lucid/Database'
import { sourceFiles } from '../../Helpers/LucidCommandsUtils'
import CmmaConfiguration from '../../Models/CmmaConfiguration'
import CmmaNodePathActions from '../../Actions/CmmaNodePathActions'

/**
 * Migration source exposes the API to read the migration files
 * from disk for a given connection.
 */
export class CmmaMigratorSource {
  constructor(
    private config: ConnectionConfig,
    private app: ApplicationContract,
    private cmmaConfigObject: CmmaConfiguration
  ) {}

  /**
   * Returns an array of files inside a given directory. Relative
   * paths are resolved from the project root
   */
  private async getDirectoryFiles(directoryPath: string): Promise<FileNode<unknown>[]> {
    const { files } = await sourceFiles(
      this.app.appRoot,
      directoryPath,
      this.config.migrations?.naturalSort || false
    )

    return files
  }

  /**
   * Gets Migrations from CMMA Configuration. If paths
   * are not defined, then `database/migrations` fallback is used
   */
  private getMigrationsPath(): string[] {
    // NOTE
    const migrationDirectoriesNodePaths =
      CmmaNodePathActions.listProjectMigrationsDirectoryNodePath(this.cmmaConfigObject)

    const directories = migrationDirectoriesNodePaths.map((nodePath) =>
      nodePath.getMigrationTypePath()
    )

    const defaultDirectory = this.app.directoriesMap.get('migrations') || 'database/migrations'
    return directories && directories.length ? directories : [`./${defaultDirectory}`]
  }

  /**
   * Returns an array of files for all defined directories
   */
  public async getMigrations() {
    const migrationPaths = this.getMigrationsPath()

    const directories = await Promise.all(
      migrationPaths.map((directoryPath) => {
        return this.getDirectoryFiles(directoryPath)
      })
    )

    return directories.reduce((result, directory) => {
      result = result.concat(directory)
      return result
    }, [])
  }
}
