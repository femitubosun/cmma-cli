import { BaseCmmaBoundaryCommand } from '../../../../cmma/BaseCommands/BaseCmmaBoundaryCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../../cmma/Models/CmmaConfiguration'
import CmmaFileActions from '../../../../cmma/Actions/CmmaFileActions'
import CmmaConfigurationActions from '../../../../cmma/Actions/CmmaConfigurationActions'
import CmmaContextActions from '../../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../../cmma/Actions/CmmaSystemActions'
import CmmaNodePath from '../../../../cmma/Models/CmmaNodePath'
import CmmaProjectMapActions from '../../../../cmma/Actions/CmmaProjectMapActions'

export default class System extends BaseCmmaBoundaryCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-system'
  public static description = 'Make a new CMMA System'
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
  @args.string({ description: 'Name of the System to be Created' })
  public name: string

  /*
   |--------------------------------------------------------------------------------
   | CMMA Configuration
   |--------------------------------------------------------------------------------
   |
   */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|sys'
  protected targetEntity: string = 'System'

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
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

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
        contextMap: this.contextMap,
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

    defaultSystem.systemLabel = this.systemLabel

    CmmaContextActions.addSystemToContext({
      systemLabel: this.systemLabel,
      contextMap: this.contextMap,
      system: defaultSystem,
    })

    /**
     * Generate Default System Artifact Directories
     */
    for (let systemArtifactDirectoryLabel of CmmaConfigurationActions.whatIsDefaultSystemArtifactDirs(
      this.PROJECT_CONFIG
    )) {
      const artifactDirectoryFilePath = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(this.contextLabel)
        .toSystem(this.systemLabel)
        .toArtifactsDir(systemArtifactDirectoryLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      CmmaFileActions.ensureADirectoryExits(artifactDirectoryFilePath)
    }

    /**
     * Generate System Routes File
     */
    const systemRoutesFilePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('routes')
      .toArtifactWithExtension({
        artifactLabel: 'index',
        artifactType: 'file',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.ensureAFileExists(systemRoutesFilePath)

    this.logger.action('create').succeeded(systemRoutesFilePath)

    /**
     * Import System Routes into Context Routes
     */
    const systemToSystemRoutesRelativePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toSystem(this.systemLabel)
      .toArtifactsDir('routes')
      .toArtifactWithoutExtension({
        artifactLabel: 'index',
        artifactType: 'file',
      })
      .getRelativePath()

    const IMPORT_SYSTEM_ROUTE_STRING = `import './${systemToSystemRoutesRelativePath}'`

    const contextRoutesFilePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toArtifactWithExtension({
        artifactLabel: this.contextLabel,
        artifactType: 'route',
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
    const internalApiDestinationPath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
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
      CmmaProjectMapActions.getContextIndexByLabel({
        projectMap: this.projectMap,
        contextLabel: this.contextLabel,
      }),
      CmmaContextActions.listSystemsInContext(this.contextMap).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
