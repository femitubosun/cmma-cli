import { BaseCmmaBoundaryCommand } from '../../cmma/CommandBase/BaseCmmaBoundaryCommand'
import { flags } from '@adonisjs/core/build/standalone'
import CmmaProjectCasePatternType from '../../cmma/TypeChecking/CmmaProjectCasePatternType'
import CmmaConfigurationActions from '../../cmma/Actions/CmmaConfigurationActions'
import CmmaProjectMapActions from '../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'
import CmmaContextActions from '../../cmma/Actions/CmmaContextActions'
import CmmaDefaultSystemArtifactDirLabel from '../../cmma/TypeChecking/CmmaDefaultSystemArtifactDirLabel'
import CmmaNodeMap from '../../cmma/Models/CmmaNodeMap'

export default class Init extends BaseCmmaBoundaryCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:init'
  public static description = "Initialize Project for Crenet's Modular Monolith Architecture(CMMA)"
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }
  /**
   * Initialize without creating Contexts
   */
  @flags.boolean({ description: 'Initialize Empty CMMA Project', alias: 'e' })
  public empty: boolean

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'in'
  protected boundaryObject = CmmaProjectMapActions.blankProjectMap
  protected PROJECT_CONFIG = CmmaConfigurationActions.blankCmmaConfiguration

  /**
   * Customizable Project Defaults
   */
  private defaultCmmaProjectRoot = 'Systems'
  private defaultCmmaSystemInternalApiSuffix = 'System'
  private defaultCmmaModuleDirIn: Array<CmmaDefaultSystemArtifactDirLabel> = [
    'controllers',
    'validators',
  ]
  private defaultProjectRoutesFileName = 'Project'
  private defaultCmmaProjectCasePattern: CmmaProjectCasePatternType = 'pascalcase'
  private defaultCmmaProjectSystemArtifactDirectories: Array<CmmaDefaultSystemArtifactDirLabel> = [
    'actions',
    'controllers',
    'migrations',
    'models',
    'routes',
    'typechecking',
    'views',
  ]
  // Todo Make Log an Entity
  private defaultCmmaLogs = []
  private defaultCmmaProjectMap = CmmaProjectMapActions.blankProjectMap

  public async run() {
    /**
     * Check Configuration File Exists
     */

    if (this.projectConfigFileExists) {
      this.logger.error(
        `Config file: ${this.colors.cyan(
          this.CONFIG_FILE_NAME
        )} already exists. Proceeding will overwrite existing configuration file.`
      )
      const confirmProceed = await this.prompt.confirm('Proceed?')

      if (!confirmProceed) {
        this.logger.info('Exiting....')
        await this.exit()
      }

      await this.kernel.exec('cmma:clean', ['y'])
    }

    /**
     * Set CMMA Defaults
     */
    this.PROJECT_CONFIG.defaultProjectRootDirInApp = this.defaultCmmaProjectRoot
    this.PROJECT_CONFIG.defaultSystemInternalApiSuffix = this.defaultCmmaSystemInternalApiSuffix
    this.PROJECT_CONFIG.defaultCasePattern = this.defaultCmmaProjectCasePattern
    this.PROJECT_CONFIG.defaultProjectRoutesFileName = this.defaultProjectRoutesFileName
    this.PROJECT_CONFIG.defaultModuleDirIn = this.defaultCmmaModuleDirIn
    this.PROJECT_CONFIG.defaultSystemArtifactDirs = this.defaultCmmaProjectSystemArtifactDirectories
    this.PROJECT_CONFIG.logs = this.defaultCmmaLogs
    this.PROJECT_CONFIG.projectMap = this.defaultCmmaProjectMap

    const projectMap = this.PROJECT_CONFIG.projectMap

    /**
     * Display Project Defaults
     */
    this.ui
      .sticker()
      .heading("Initializing Adonis Project for Crenet's Modular Monolith Architecture (C.M.M.A)")
      .add('Project Defaults')
      .add('')
      .add(
        `Contexts' Location:                   ./app/${this.PROJECT_CONFIG.defaultProjectRootDirInApp}`
      )
      .add(
        `System Internal API Suffix:           ${this.PROJECT_CONFIG.defaultSystemInternalApiSuffix}`
      )
      .add(`Case Pattern for Generated Files:     ${this.PROJECT_CONFIG.defaultCasePattern}`)
      .add(
        `Project Routes Filename:              ${this.PROJECT_CONFIG.defaultProjectRoutesFileName}`
      )
      .add(`Create Module Directory In:           ${this.PROJECT_CONFIG.defaultModuleDirIn}`)

      .add(`Default System Directories:           ${this.PROJECT_CONFIG.defaultSystemArtifactDirs}`)

      .render()

    /**
     * Create Project Files
     *
     * 1. Routes
     * 2. TODO Views
     */

    /**
     * Create RoutesFile
     */

    const projectRoutesNodePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toArtifact({
        artifactLabel: this.PROJECT_CONFIG.defaultProjectRoutesFileName,
        artifactType: 'routes',
      })

    const projectRoutesFilePath = CmmaFileActions.createAbsolutePathFromNodePath({
      nodePath: projectRoutesNodePath,
      applicationRoot: this.application.appRoot,
      projectRootDirInApp: this.PROJECT_CONFIG.defaultProjectRootDirInApp,
    })

    CmmaFileActions.ensureAFileExists(projectRoutesFilePath)

    this.logger.action('create').succeeded(projectRoutesFilePath)

    CmmaProjectMapActions.addArtifactToProject({
      artifact: this.PROJECT_CONFIG.defaultProjectRoutesFileName,
      projectMap,
    })

    /**
     * Import Project Routes into Adonis
     */
    const adonisRoutesPath = CmmaFileActions.joinPath([
      this.application.appRoot,
      'start',
      'routes.ts',
    ])

    const projectImportString = `import 'App/Systems/${CmmaConfigurationActions.resolveArtifactLabel(
      {
        artifactLabel: this.PROJECT_CONFIG.defaultProjectRoutesFileName + 'Routes',
        artifactGroupLabel: 'routes',
        configObject: this.PROJECT_CONFIG,
      }
    )}'`

    CmmaFileActions.appendToFile({
      filePath: adonisRoutesPath,
      text: projectImportString,
    })

    this.logger.action('update').succeeded(adonisRoutesPath)

    /**
     * Get Context Labels from User Input
     */

    const SHOULD_INITIALIZE_PROJECT_CONTEXTS = !this.empty

    if (SHOULD_INITIALIZE_PROJECT_CONTEXTS) {
      let contextLabel = 'context'
      const defaultContextObject = CmmaContextActions.blankContext

      while (contextLabel) {
        contextLabel = await this.prompt.ask(
          'Enter the name of a Context. Or enter leave empty to lock your entries'
        )

        contextLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
          identifier: contextLabel,
          configObject: this.PROJECT_CONFIG,
        })

        if (!contextLabel) break

        this.logger.info(`Registering Project Context: ${contextLabel}`)

        if (
          CmmaProjectMapActions.isContextInProject({
            contextLabel,
            projectMap,
          })
        ) {
          this.logger.warning('You have already registered this Context. Ignoring...')
          continue
        }

        /**
         * Add Context to Project
         */

        CmmaProjectMapActions.addContextToProject({
          contextLabel,
          context: defaultContextObject,
          projectMap,
        })

        this.logger.success(`Registered Project Context: ${contextLabel}`)
      }
    }

    /**
     * Generate Context Files
     * 1. Create Destination Node Path
     * 2. Create File Path
     * 3. Generate
     */

    for (let contextLabel of CmmaProjectMapActions.listContextsInProject(projectMap)) {
      const contextRoutesFileNodePath = new CmmaNodeMap(this.PROJECT_CONFIG)
        .buildPathFromNullNode()
        .toContext(contextLabel)

      const contextRoutesDestinationFilePath = CmmaFileActions.createAbsolutePathFromNodePath({
        nodePath: contextRoutesFileNodePath,
        applicationRoot: this.application.appRoot,
        projectRootDirInApp: this.PROJECT_CONFIG.defaultProjectRootDirInApp,
      })

      const generatedContextRoutesFile = this.generator
        .addFile(
          contextLabel,
          CmmaConfigurationActions.getArtifactGroupTransformation({
            artifactGroup: 'routes',
            configObject: this.PROJECT_CONFIG,
          })
        )
        .destinationDir(contextRoutesDestinationFilePath)

      const contextImportString = `import './${contextLabel}/${
        generatedContextRoutesFile.toJSON().filename
      }'`

      CmmaFileActions.appendToFile({
        filePath: projectRoutesFilePath,
        text: contextImportString,
      })
    }

    await this.generator.run()

    const projectContexts = CmmaProjectMapActions.listContextsInProject(projectMap)

    for (let i = 0; i < projectContexts.length; i++) this.commandArgs.push(i)

    this.finishCmmaCommand()
  }
}
