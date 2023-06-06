import { flags } from '@adonisjs/core/build/standalone'
import { MigrationListNode } from '@ioc:Adonis/Lucid/Migrator'
import { CmmaMigratorContract } from '../../../cmma/TypeChecking/Migration/CmmaMigratorContract'
import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'

/**
 * The command is meant to migrate the database by execute migrations
 * in `up` direction.
 */
export default class Status extends BaseCmmaCommand {
  public static commandName = 'cmma:migration-status'
  public static description = 'View migrations status'
  public static settings = {
    loadApp: true,
  }

  private migrator: CmmaMigratorContract

  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode = 'mig|sta'

  /**
   * Define custom connection
   */
  @flags.string({ description: 'Define a custom database connection', alias: 'c' })
  public connection: string

  /**
   * Not a valid connection
   */
  protected printNotAValidConnection(connection: string) {
    this.logger.error(
      `"${connection}" is not a valid connection name. Double check "config/database" file`
    )
  }

  /**
   * Colorizes the status string
   */
  private colorizeStatus(status: MigrationListNode['status']): string {
    switch (status) {
      case 'pending':
        return this.colors.yellow('pending')
      case 'migrated':
        return this.colors.green('completed')
      case 'corrupt':
        return this.colors.red('corrupt')
    }
  }

  /**
   * Instantiating the migrator instance
   */
  private instantiateMigrator() {
    const db = this.application.container.use('Adonis/Lucid/Database')
    this.application.container.resolveBinding('Adonis/Lucid/Migrator')
    this.migrator = new CmmaMigratorContract(
      db,
      this.application,
      {
        direction: 'up',
        connectionName: this.connection,
      },
      this.PROJECT_CONFIG
    )
  }

  /**
   * Render list inside a table
   */
  private renderList(list: MigrationListNode[]) {
    const table = this.ui.table()
    table.head(['Name', 'Status', 'Batch', 'Message'])

    /**
     * Push a new row to the table
     */
    list.forEach((node) => {
      table.row([
        node.name,
        this.colorizeStatus(node.status),
        node.batch ? String(node.batch) : 'NA',
        node.status === 'corrupt' ? 'The migration file is missing on filesystem' : '',
      ])
    })

    table.render()
  }

  /**
   * Run as a subcommand. Never close database connections or exit
   * process inside this method
   */
  private async runAsSubCommand() {
    const db = this.application.container.use('Adonis/Lucid/Database')
    this.connection = this.connection || db.primaryConnectionName

    /**
     * Not a valid connection
     */
    if (!db.manager.has(this.connection)) {
      this.printNotAValidConnection(this.connection)
      this.exitCode = 1
      return
    }

    this.instantiateMigrator()
    this.renderList(await this.migrator.getList())
  }

  /**
   * Branching out, so that if required we can implement
   * "runAsMain" separately from "runAsSubCommand".
   *
   * For now, they both are the same
   */
  private async runAsMain() {
    await this.runAsSubCommand()
  }

  /**
   * Handle command
   */
  public async run(): Promise<void> {
    await this.ensureConfigFileExistsCommandStep()

    if (this.isMain) {
      await this.runAsMain()
    } else {
      await this.runAsSubCommand()
    }
  }

  /**
   * Lifecycle method invoked by ace after the "run"
   * method.
   */
  public async completed() {
    if (this.migrator && this.isMain) {
      await this.migrator.close()
    }
  }
}
