import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args, flags } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaArtifactDirs from '../../../cmma/TypeChecking/CmmaArtifactDirs'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import { string } from '@ioc:Adonis/Core/Helpers'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaStringTransformations from 'cmma/TypeChecking/StringTransformations'
import CmmaArtifactType from '../../../cmma/TypeChecking/CmmaArtifactType'

export default class Migration extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-action'
  public static description = 'Create a new CMMA Action'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /*
  |--------------------------------------------------------------------------------
  | Command Arguments
  |--------------------------------------------------------------------------------
  |
  */
  @args.string({ description: 'Name of the View to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|mig'
  protected artifactLabel: string
  protected targetEntity = 'Migration'
  protected artifactType: CmmaArtifactType = 'migration'
  protected artifactGroupDir: CmmaArtifactDirs = 'migrations'
  private tableName: string

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
   * Not a valid connection
   */
  private printNotAValidConnection(connection: string) {
    this.logger.error(
      `"${connection}" is not a valid connection name. Double check "config/database" file`
    )
  }

  protected getTemplateFileDir(): string {
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
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()
    /**
     * Compute Name. Delete Prefix if included in argument
     */

    this.artifactLabel = this.name

    const migrationLabelTransformation =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'migration',
        configObject: this.PROJECT_CONFIG,
      })

    let migrationName = CmmaConfigurationActions.transformLabel({
      label: this.artifactLabel,
      transformations: migrationLabelTransformation,
    })

    /**
     * Add '+' suffix for alter migration
     */
    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: migrationName,
        systemMap: this.systemMap,
        artifactDir: 'migrations',
      })
    ) {
      migrationName = migrationName + '+'
    }

    this.computedNameWithSuffix = migrationName
    this.computedNameWithoutSuffix = migrationName

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: migrationName,
      artifactsDir: 'migrations',
      systemMap: this.systemMap,
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

    // this.commandArgs = [
    //   CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
    //   CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    //   CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    //   CmmaSystemActions.listSystemArtifactsByGroupLabel({
    //     systemMap,
    //     artifactGroupLabel: 'migrations',
    //   }).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
