import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDirs from '../../../cmma/TypeChecking/CmmaArtifactDirs'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import {
  EXITING,
  YOU_HAVE_ALREADY_REGISTERED_CONTROLLER_IN_MODULE,
} from '../../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaArtifactType from '../../../cmma/TypeChecking/CmmaArtifactType'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'

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
  protected commandShortCode = 'mk|ctr'
  protected artifactLabel: string
  protected targetEntity = 'Controller'
  protected artifactGroupDir: CmmaArtifactDirs = 'controllers'
  protected artifactType: CmmaArtifactType = 'controller'

  protected getArtifactDestinationNodePath() {
    const nodePath = new CmmaNodePath(this.PROJECT_CONFIG).buildPath()

    nodePath
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir(this.artifactGroupDir)
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
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
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
     */
    this.commandArgs = [
      CmmaProjectMapActions.getContextIndexByLabel({
        projectMap: this.projectMap,
        contextLabel: this.contextLabel,
      }),
      CmmaContextActions.getSystemIndexByLabel({
        contextMap: this.contextMap,
        systemLabel: this.systemLabel,
      }),
      CmmaSystemActions.getModuleIndexByLabel({
        systemMap: this.systemMap,
        moduleLabel: this.moduleLabel,
      }),
      CmmaModuleActions.listModuleControllers(this.moduleMap).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
