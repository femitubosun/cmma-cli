import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDir from '../../../cmma/TypeChecking/CmmaArtifactDir'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import {
  EXITING,
  YOU_HAVE_ALREADY_REGISTERED_CONTROLLER_IN_MODULE,
} from '../../../cmma/Helpers/SystemMessages'

export default class Controller extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-controller'
  public static description = 'Create a new CMMA Context'
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
  @args.string({ description: 'Name of the Context to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected projectMap = this.PROJECT_CONFIG.projectMap
  protected commandShortCode = 'mk|ctr'
  protected artifactLabel: string
  protected targetEntity = 'Controller'
  protected artifactGroupDirLabel: CmmaArtifactDir = 'controllers'

  protected getArtifactDestinationNodePath() {
    const nodePath = new CmmaNodePath(this.PROJECT_CONFIG).drawPath()

    nodePath
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir(this.artifactGroupDirLabel)
      .toModule(this.moduleLabel)

    return nodePath
  }

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    await this.selectModuleCommandStep()

    /**
     * Compute Name. Delete Prefix if included in argument
     */

    this.artifactLabel = this.name

    const controllerTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithExtension({
        artifactType: 'controller',
        configObject: this.PROJECT_CONFIG,
      })

    this.artifactLabel = CmmaConfigurationActions.transformLabel({
      transformations: controllerTransformations,
      label: this.artifactLabel,
    })

    /*
     * Ensure the Controller isn't already in module
     */

    if (
      CmmaModuleActions.isControllerInModule({
        moduleMap: this.moduleMap,
        controllerLabel: this.artifactLabel,
      })
    ) {
      this.logger.warning(`${YOU_HAVE_ALREADY_REGISTERED_CONTROLLER_IN_MODULE}. ${EXITING}`)
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(this.artifactLabel)} Artifact in ${this.colors.underline(
        this.moduleLabel
      )} Module in ${this.colors.underline(this.systemLabel)} System in ${this.colors.underline(
        this.contextLabel
      )} Context.`
    )

    CmmaModuleActions.addModuleControllerToModule({
      controller: this.artifactLabel,
      moduleMap: this.moduleMap,
    })

    /**
     * Generate Controller
     */
    await this.generate()

    /**
     * Finish Command
     * Todo ARgs
     */
    // this.commandArgs = [
    //   CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
    //   CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    //   CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    //   CmmaModuleActions.listModuleControllers(moduleMap).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
