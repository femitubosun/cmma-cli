import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDirs from '../../../cmma/TypeChecking/CmmaArtifactDirs'
import { YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM } from '../../../cmma/Helpers/SystemMessages/SystemMessages'

export default class Model extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-model'
  public static description = 'Create a new CMMA Model'
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
  @args.string({ description: 'Name of the Model to be Created' })
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
  protected targetEntity = 'Model'
  protected artifactType: CmmaArtifactDirs = 'models'

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    /**
     * Compute Name. Delete Prefix if included in argument
     */
    this.artifactLabel = this.name

    const modelTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'model',
        configObject: this.PROJECT_CONFIG,
      })

    this.artifactLabel = CmmaConfigurationActions.transformLabel({
      transformations: modelTransformations,
      label: this.artifactLabel,
    })

    /*
     * Ensure the Model isn't already in module
     */

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        systemMap: this.systemMap,
        artifactGroupLabel: 'models',
        artifactLabel: this.artifactLabel,
      })
    ) {
      this.logger.warning(YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM)
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(this.artifactLabel)} ${
        this.artifactLabel
      } Artifact in ${this.colors.underline(this.systemLabel)} System in ${this.colors.underline(
        this.contextLabel
      )} Context.`
    )

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: this.artifactLabel,
      artifactsDir: 'models',
      systemMap: this.systemMap,
    })

    /**
     * Generate Model
     */
    await this.generate()

    /**
     * Finish Command
     */
    // this.commandArgs = [
    //   CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
    //   CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    //   CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    //   CmmaSystemActions.listSystemArtifactsByGroupLabel({
    //     systemMap,
    //     artifactGroupLabel: 'models',
    //   }).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
