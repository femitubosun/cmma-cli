import { BaseCmmaBoundaryCommand } from '../../cmma/BaseCommands/BaseCmmaBoundaryCommand'
import { flags } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../cmma/Actions/CmmaConfigurationActions'
import CmmaProjectMapActions from '../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'
import CmmaContextActions from '../../cmma/Actions/CmmaContextActions'
import CmmaNodePath from '../../cmma/Models/CmmaNodePath'
import {
  INITIALIZING_ADONIS_PROJECT_FOR_CMMA,
  YOU_HAVE_ALREADY_REGISTERED_CONTEXT_IN_PROJECT,
} from '../../cmma/Helpers/SystemMessages'
import CmmaConfiguration from '../../cmma/TypeChecking/CmmaConfiguration'

export default class Init extends BaseCmmaBoundaryCommand {
  /*
   |--------------------------------------------------------------------------------
   | ACE Command Configuration
   |--------------------------------------------------------------------------------
   |
   */
  public static commandName = 'cmma:init'
  public static description = "Initialize Project for Crenet's Modular Monolith Architecture(CMMA)"
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /*
  |--------------------------------------------------------------------------------
  | Command Arguments & Flags
  |--------------------------------------------------------------------------------
  |
  */
  @flags.boolean({ description: 'Initialize Empty CMMA Project', alias: 'e' })
  public empty: boolean

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected projectMap = this.PROJECT_CONFIG.projectMap
  protected commandShortCode = 'in'
  protected artifactLabel: string
  protected targetEntity = 'Context'

  /*
  |--------------------------------------------------------------------------------
  | Display Project Defaults to User Before Initializing
  |--------------------------------------------------------------------------------
  |
  */
  protected displayProjectDefaultsCommandStep() {
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
  }

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    this.displayProjectDefaultsCommandStep()

    /**
     * Create RoutesFile
     */
    const projectRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toArtifactWithExtension({
        artifactLabel: 'Project',
        artifactType: 'route',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.ensureAFileExists(projectRoutesFile)

    this.logger.action('create').succeeded(projectRoutesFile)

    const PROJECT_ROUTES_FILENAME = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toArtifactWithoutExtension({
        artifactLabel: 'Project',
        artifactType: 'route',
      }).artifactLabel

    CmmaProjectMapActions.addArtifactToProject({
      artifact: PROJECT_ROUTES_FILENAME!,
      projectMap: this.projectMap,
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
            projectMap: this.projectMap,
          })
        ) {
          this.logger.warning(YOU_HAVE_ALREADY_REGISTERED_CONTEXT_IN_PROJECT)
          continue
        }

        /**
         * Add Context to Project
         */

        const defaultContextObject = CmmaContextActions.blankContext

        defaultContextObject.contextLabel = contextLabel

        CmmaProjectMapActions.addContextToProject({
          contextLabel,
          context: defaultContextObject,
          projectMap: this.projectMap,
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

    for (let contextLabel of CmmaProjectMapActions.listContextsInProject(this.projectMap)) {
      const contextDir = new CmmaNodePath(this.PROJECT_CONFIG)
        .drawPath()
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
        filePath: projectRoutesFile,
        text: contextImportString,
      })
    }

    await this.generator.run()

    const projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    for (let i = 0; i < projectContexts.length; i++) this.commandArgs.push(i)

    this.finishCmmaCommand()
  }
}
