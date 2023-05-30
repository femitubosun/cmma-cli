import { BaseCmmaBoundaryCommand } from '../../../cmma/CommandBase/BaseCmmaBoundaryCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaNodeMap from '../../../cmma/Models/CmmaNodeMap'

export default class System extends BaseCmmaBoundaryCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-system'
  public static description = 'Make a new CMMA System'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the System to be Created' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|sys'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  private contextLabel: string
  private systemLabel: string

  private getInternalApiStub() {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    templatesDir.push('api.txt')

    return CmmaFileActions.joinPath(templatesDir)
  }

  public getTemplateData() {
    return {
      systemLabel: this.systemLabel,
    }
  }

  public async run() {
    await this.startCmmaCommand()

    /**
     * Project Map Defined as Early As Possible
     */
    const projectMap = this.PROJECT_CONFIG.projectMap

    /**
     * Ensure Target Exist
     */
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
      'What Context does this System belong to?',
      projectContextLabels
    )

    const contextMap = projectMap.contexts[this.contextLabel]

    /**
     * Ensure the System isn't already in Project
     */
    this.systemLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: this.name,
      configObject: this.PROJECT_CONFIG,
    })

    if (
      CmmaContextActions.isSystemInContext({
        systemLabel: this.systemLabel,
        contextMap,
      })
    ) {
      this.logger.warning(
        `You have already registered '${this.systemLabel}' System in '${this.contextLabel}' Context. Ignoring...`
      )
      await this.exit()
    }

    /**
     * Add Blank System to Context
     */
    const defaultSystem = CmmaSystemActions.blankSystemMap

    CmmaContextActions.addSystemToContext({
      systemLabel: this.systemLabel,
      contextMap,
      system: defaultSystem,
    })

    /**
     * Generate Default System Artifact Directories
     */
    for (let systemArtifactDirectoryLabel of CmmaConfigurationActions.whatIsDefaultSystemArtifactDirs(
      this.PROJECT_CONFIG
    )) {
      const artifactDirectoryFilePath = new CmmaNodeMap(this.PROJECT_CONFIG)
        .buildPathFromNullNode()
        .toContext(this.contextLabel)
        .toSystem(this.systemLabel)
        .toSystemArtifactsDir(systemArtifactDirectoryLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      CmmaFileActions.ensureADirectoryExits(artifactDirectoryFilePath)
    }

    /**
     * Generate System Routes File
     */
    const systemRoutesFilePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('routes')
      .toArtifact({
        artifactLabel: 'index',
        artifactType: 'file',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.ensureAFileExists(systemRoutesFilePath)

    this.logger.action('create').succeeded(systemRoutesFilePath)

    /**
     * Import System Routes into Context Routes
     */
    const systemToSystemRoutesRelativePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('routes')
      .toArtifact({
        artifactLabel: 'index',
        artifactType: 'file',
      })
      .getRelativePath(true)

    const IMPORT_SYSTEM_ROUTE_STRING = `import './${systemToSystemRoutesRelativePath}'`

    const contextRoutesFilePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toArtifact({
        artifactLabel: this.contextLabel,
        artifactType: 'routes',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.appendToFile({
      filePath: contextRoutesFilePath,
      text: IMPORT_SYSTEM_ROUTE_STRING,
    })

    this.logger.action('update').succeeded(contextRoutesFilePath)

    /**
     * Generate Internal Api
     */
    const internalApiDestinationPath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    this.generator
      .addFile(this.systemLabel, {
        pattern: CmmaConfigurationActions.whatIsDefaultCasePattern(this.PROJECT_CONFIG),
        extname: '.ts',
        suffix: CmmaConfigurationActions.whatIsDefaultSystemSuffix(this.PROJECT_CONFIG),
      })
      .destinationDir(internalApiDestinationPath)
      .stub(this.getInternalApiStub())
      .useMustache()
      .apply(this.getTemplateData())

    await this.generator.run()

    /**
     * Finish Command
     */
    this.commandArgs = [
      CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
      CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
