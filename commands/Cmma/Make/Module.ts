import { BaseCmmaBoundaryCommand } from '../../../cmma/BaseCommands/BaseCmmaBoundaryCommand'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import { args } from '@adonisjs/core/build/standalone'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

export default class Module extends BaseCmmaBoundaryCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-module'
  public static description = 'Make a new CMMA CmmaModule'
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
  protected commandShortCode = 'mk|mod'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string

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
      'What Context does this Module belong to?',
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
      'What System does this Module Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    /**
     * Ensure Module isn't already in System
     */
    this.moduleLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: this.name,
      configObject: this.PROJECT_CONFIG,
    })

    if (
      CmmaSystemActions.isModuleInSystem({
        moduleLabel: this.moduleLabel,
        systemMap,
      })
    ) {
      this.logger.warning(
        `You have already registered '${this.moduleLabel}' Module in '${this.contextLabel}' System. Ignoring...`
      )
      await this.exit()
    }

    /**
     * Add Blank Module to System
     */
    const defaultModule = CmmaModuleActions.blankModuleMap

    CmmaSystemActions.addModuleToSystem({
      module: defaultModule,
      moduleLabel: this.moduleLabel,
      systemMap,
    })

    /**
     * Generate Module Directory in Target Directories e.g Controllers, Validators
     */
    for (let moduleDestinationDir of CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
      this.PROJECT_CONFIG
    )) {
      const moduleDirectory = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPathFromNullNode()
        .toContext(this.contextLabel)
        .toSystem(this.systemLabel)
        .toSystemArtifactsDir(moduleDestinationDir)
        .toModule(this.moduleLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      CmmaFileActions.ensureADirectoryExits(moduleDirectory)

      this.logger.action('create').succeeded(moduleDirectory)
    }

    /**
     * Create Module Routes File
     */
    const moduleRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('routes')
      .toArtifact({
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
      .buildPathFromNullNode()
      .toArtifact({
        artifactLabel: this.moduleLabel,
        artifactType: 'route',
        noExt: true,
      })
      .getRelativePath()

    const IMPORT_MODULE_ROUTES_STRING = `import './${moduleRoutesPath}'`

    const systemRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('routes')
      .toArtifact({
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
    this.commandArgs = [
      CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
      CmmaContextActions.listSystemsInContext(contextMap).length - 1,
      CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
