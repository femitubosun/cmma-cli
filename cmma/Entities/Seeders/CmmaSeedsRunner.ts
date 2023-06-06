import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { FileNode, DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import { SeederFileNode, SeederConstructorContract } from '@ioc:Adonis/Lucid/Seeder'
import { CmmaSeedersSource } from './CmmaSeedersSource'
import CmmaConfiguration from '../../Models/CmmaConfiguration'

/**
 * Seeds Runner exposes the API to traverse seeders and execute them
 * in bulk
 */
export class CmmaSeedsRunner {
  private client = this.db.connection(this.connectionName || this.db.primaryConnectionName)

  constructor(
    private db: DatabaseContract,
    private app: ApplicationContract,
    private cmmaConfig: CmmaConfiguration,
    private connectionName?: string
  ) {}

  /**
   * Returns the seeder source by ensuring value is a class constructor
   */
  private async getSeederSource(file: FileNode<unknown>): Promise<SeederConstructorContract> {
    const source = await file.getSource()
    if (typeof source === 'function') {
      return source as SeederConstructorContract
    }

    throw new Error(`Invalid schema class exported by "${file.name}"`)
  }

  /**
   * Returns an array of seeders
   */
  public async getList() {
    return new CmmaSeedersSource(this.app, this.cmmaConfig).getSeeders()
  }

  /**
   * Executes the seeder
   */
  public async run(file: FileNode<unknown>): Promise<SeederFileNode> {
    const Source = await this.getSeederSource(file)

    const seeder: SeederFileNode = {
      status: 'pending',
      file: file,
    }

    if ('developmentOnly' in Source) {
      this.app.logger.warn(`Seeder "${file.name}" is using the deprecated flag "developmentOnly".`)
    }

    /**
     * Ignore when when the node environement is not the same as the seeder configuration.
     */
    if (
      (Source.developmentOnly && !this.app.inDev) ||
      (Source.environment && !Source.environment.includes(this.app.nodeEnvironment))
    ) {
      seeder.status = 'ignored'
      return seeder
    }

    try {
      const seederInstance = new Source(this.client)
      if (typeof seederInstance.run !== 'function') {
        throw new Error(`Missing method "run" on "${seeder.file.name}" seeder`)
      }

      await seederInstance.run()
      seeder.status = 'completed'
    } catch (error) {
      seeder.status = 'failed'
      seeder.error = error
    }

    return seeder
  }

  /**
   * Close database connections
   */
  public async close() {
    await this.db.manager.closeAll(true)
  }
}
