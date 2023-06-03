import { BaseCmmaBoundaryCommand } from '../../../cmma/BaseCommands/BaseCmmaBoundaryCommand'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import { args } from '@adonisjs/core/build/standalone'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

export default class Module extends BaseCmmaBoundaryCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-module'
  public static description = 'Make a new CMMA CmmaModule'
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
  protected commandShortCode = 'mk|act'
  protected artifactLabel: string
  protected targetEntity = 'Module'

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    /**
     * Add Blank Module to System
     */

    this.moduleLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: this.name,
      configObject: this.PROJECT_CONFIG,
    })

    const defaultModule = CmmaModuleActions.blankModuleMap

    defaultModule.moduleLabel = this.moduleLabel

    CmmaSystemActions.addModuleToSystem({
      module: defaultModule,
      moduleLabel: this.moduleLabel,
      systemMap: this.systemMap,
    })

    /**
     * Generate Module Directory in Target Directories e.g Controllers, Validators
     */
    for (let moduleDestinationDir of CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
      this.PROJECT_CONFIG
    )) {
      const moduleDirectory = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(this.contextLabel)
        .toSystem(this.systemLabel)
        .toArtifactsDir(moduleDestinationDir)
        .toModule(this.moduleLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      CmmaFileActions.ensureADirectoryExits(moduleDirectory)

      this.logger.action('create').succeeded(moduleDirectory)
    }

    /**
     * Create Module Routes File
     */
    const moduleRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('routes')
      .toArtifactWithExtension({
        artifactLabel: this.moduleLabel,
        artifactType: 'route',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.ensureAFileExists(moduleRoutesFile)

    this.logger.action('create').succeeded(moduleRoutesFile)

    /**
     * Import Module Route into System
     */
    const moduleRoutesPath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toArtifactWithoutExtension({
        artifactLabel: this.moduleLabel,
        artifactType: 'route',
      })
      .getRelativePath()

    const IMPORT_MODULE_ROUTES_STRING = `import './${moduleRoutesPath}'`

    const systemRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('routes')
      .toArtifactWithExtension({
        artifactLabel: 'index',
        artifactType: 'file',
      })
      .getAbsoluteOsPath(this.application.appRoot)

    CmmaFileActions.appendToFile({
      filePath: systemRoutesFile,
      text: IMPORT_MODULE_ROUTES_STRING,
    })

    this.logger.action('update').succeeded(systemRoutesFile)

    /**
     * Finish Command
     */
    // this.commandArgs = [
    //   CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
    //   CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    //   CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
