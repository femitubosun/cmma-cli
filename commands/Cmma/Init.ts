import { BaseCmmaBoundaryCommand } from '../../cmma/CommandBase/BaseCmmaBoundaryCommand'
import { flags } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../cmma/Actions/CmmaConfigurationActions'
import CmmaProjectMapActions from '../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'
import CmmaContextActions from '../../cmma/Actions/CmmaContextActions'
import CmmaNodeMap from '../../cmma/Models/CmmaNodeMap'
import { INITIALIZING_ADONIS_PROJECT_FOR_CMMA } from '../../cmma/Helpers/SystemMessages'

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
  protected PROJECT_CONFIG = this.projectConfiguration!

  public async run() {
    await this.startCmmaCommand()

    const projectMap = this.PROJECT_CONFIG.projectMap

    /**
     * Display Project Defaults
     */
    this.ui
      .sticker()
      .heading(INITIALIZING_ADONIS_PROJECT_FOR_CMMA)
      .add('Project Defaults')
      .add('')
      .add(
        `Contexts' Location:                   ./app/${this.PROJECT_CONFIG.defaultProjectRootDirInApp}`
      )
      .add(
        `System Internal API Suffix:           ${this.PROJECT_CONFIG.defaultSystemInternalApiSuffix}`
      )
      .add(`Case Pattern for Generated Files:     ${this.PROJECT_CONFIG.defaultCasePattern}`)
      .add(`Create Module Directory In:           ${this.PROJECT_CONFIG.defaultModuleDirIn}`)

      .add(`Default System Directories:           ${this.PROJECT_CONFIG.defaultSystemArtifactDirs}`)

      .render()

    /**
     * Create RoutesFile
     */

    const projectRoutesFileNodePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toArtifact({
        artifactLabel: 'Project',
        artifactType: 'route',
      })

    const projectRoutesFileFilePath = projectRoutesFileNodePath.getAbsoluteOsPath(
      this.application.appRoot
    )

    CmmaFileActions.ensureAFileExists(projectRoutesFileFilePath)

    this.logger.action('create').succeeded(projectRoutesFileFilePath)

    const PROJECT_ROUTES_FILENAME = projectRoutesFileNodePath.artifactLabel?.split('.')[0]

    CmmaProjectMapActions.addArtifactToProject({
      artifact: PROJECT_ROUTES_FILENAME!,
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

    const projectImportString = `import 'App/Systems/${PROJECT_ROUTES_FILENAME}'`

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
      const contextDir = new CmmaNodeMap(this.PROJECT_CONFIG)
        .buildPathFromNullNode()
        .toContext(contextLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      const generatedContextRoutesFile = this.generator
        .addFile(
          contextLabel,
          CmmaConfigurationActions.getArtifactGroupTransformation({
            artifactGroup: 'routes',
            configObject: this.PROJECT_CONFIG,
          })
        )
        .destinationDir(contextDir)

      const contextImportString = `import './${contextLabel}/${
        generatedContextRoutesFile.toJSON().filename
      }'`

      CmmaFileActions.appendToFile({
        filePath: projectRoutesFileFilePath,
        text: contextImportString,
      })
    }

    await this.generator.run()

    const projectContexts = CmmaProjectMapActions.listContextsInProject(projectMap)

    for (let i = 0; i < projectContexts.length; i++) this.commandArgs.push(i)

    this.finishCmmaCommand()
  }
}
