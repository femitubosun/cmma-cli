import { BaseCmmaArtifactCommand } from '../../../cmma/CommandBase/BaseCmmaArtifactCommand'
import { args, flags } from '@adonisjs/core/build/standalone'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import { string } from '@ioc:Adonis/Core/Helpers'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaStringTransformations from 'cmma/TypeChecking/StringTransformations'

export default class Migration extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-migration'
  public static description = 'Create a new CMMA Migration'
  public static settings = {
    loadApp: true,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the View to be Created' })
  public name: string

  /**
   * Choose a custom pre-defined connection. Otherwise, we use the
   * default connection
   */
  @flags.string({
    description: 'The connection flag is used to lookup the directory for the migration file',
  })
  public connection: string

  /**
   * Custom table name for creating a new table
   */
  @flags.string({ description: 'Define the table name for creating a new table' })
  public create: string

  /**
   * Custom table name for altering an existing table
   */
  @flags.string({ description: 'Define the table name for altering an existing table' })
  public table: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|mig'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'migrations'
  private tableName: string

  /**
   * Not a valid connection
   */
  private printNotAValidConnection(connection: string) {
    this.logger.error(
      `"${connection}" is not a valid connection name. Double check "config/database" file`
    )
  }

  protected getArtifactStub(): string {
    const migrationTemplate = this.table ? 'migration-alter.txt' : 'migration-make.txt'

    const templateDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)

    templateDir.push(migrationTemplate)

    return CmmaFileActions.joinPath(templateDir)
  }

  protected getArtifactTransformations(): CmmaStringTransformations {
    const transformations = super.getArtifactTransformations()

    transformations.prefix = this.prefix
    return transformations
  }

  protected getTemplateData(): any {
    const tableName = this.tableName

    return {
      computedNameWithSuffix: this.computedNameWithSuffix,
      computedNameWithoutSuffix: this.computedNameWithoutSuffix,

      toClassName() {
        return function (filename: string, render: (text: string) => string) {
          const migrationClassName = string.camelCase(
            tableName || render(filename).replace(this.prefix, '')
          )
          return `${migrationClassName.charAt(0).toUpperCase()}${migrationClassName.slice(1)}`
        }
      },
      toTableName() {
        return function (filename: string, render: (text: string) => string) {
          return tableName || string.snakeCase(render(filename).replace(this.prefix, ''))
        }
      },
    }
  }

  public async run() {
    await this.startCmmaCommand()
    /**
     * Project Map Defined as Early As Possible
     */
    const projectMap = this.PROJECT_CONFIG.projectMap

    const projectContextLabels = CmmaProjectMapActions.listContextsInProject(projectMap)

    if (!projectContextLabels.length) {
      this.logger.error(
        `There are no defined Contexts in this Project. Run ${this.colors.cyan(
          'node ace cmma:init'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.contextLabel = await this.prompt.choice(
      'What Context does this Migration belong to?',
      projectContextLabels
    )

    const contextMap = CmmaProjectMapActions.getContextObjectByLabel({
      contextLabel: this.contextLabel,
      projectMap,
    })

    const contextSystemLabels = CmmaContextActions.listSystemsInContext(contextMap)

    if (!contextSystemLabels.length) {
      this.logger.error(
        `There are no defined Systems in Context. Run ${this.colors.cyan(
          'node ace cmma:make-system'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.systemLabel = await this.prompt.choice(
      'What System does this Migration Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    /**
     * Compute Name. Delete Prefix if included in argument
     */

    this.artifactLabel = this.name

    const migrationLabelTransformation = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: 'migrations',
      configObject: this.PROJECT_CONFIG,
    })

    let migrationName = CmmaConfigurationActions.transformLabel({
      label: this.artifactLabel,
      transformations: migrationLabelTransformation,
      noExt: true,
    })

    /**
     * Add '+' suffix for alter migration
     */
    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: migrationName,
        systemMap,
        artifactGroupLabel: 'migrations',
      })
    ) {
      migrationName = migrationName + '+'
    }

    this.computedNameWithSuffix = migrationName
    this.computedNameWithoutSuffix = migrationName

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: migrationName,
      artifactGroupLabel: 'migrations',
      systemMap,
    })

    const db = this.application.container.use('Adonis/Lucid/Database')
    this.connection = this.connection || db.primaryConnectionName
    const connection = db.getRawConnection(this.connection || db.primaryConnectionName)

    if (!connection) {
      this.printNotAValidConnection(this.connection)
      this.exitCode = 1
      return
    }

    /**
     * Not allowed together, hence we must notify the user about the same
     */
    if (this.table && this.create) {
      this.logger.warning('--table and --create cannot be used together. Ignoring --create')
    }

    /**
     * Using the user defined table name or an empty string. We can attempt to
     * build the table name from the migration file name, but let's do that
     * later.
     */
    this.tableName = this.table || this.create || string.snakeCase(string.pluralize(this.name))

    /**
     * Prepend timestamp to keep schema files in the order they
     * have been created
     */
    this.prefix = `${new Date().getTime()}_`

    await this.generate()

    this.commandArgs = [
      CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
      CmmaContextActions.listSystemsInContext(contextMap).length - 1,
      CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
      CmmaSystemActions.listSystemArtifactsByGroupLabel({
        systemMap,
        artifactGroupLabel: 'migrations',
      }).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
