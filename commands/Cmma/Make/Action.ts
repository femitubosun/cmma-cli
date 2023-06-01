import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDir from '../../../cmma/TypeChecking/CmmaArtifactDir'
import {
  EXITING,
  YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM,
} from '../../../cmma/Helpers/SystemMessages'

export default class Action extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-action'
  public static description = 'Create a new CMMA Action'
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
  @args.string({ description: 'Name of the Action to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected projectMap = this.PROJECT_CONFIG.projectMap
  protected commandShortCode = 'mk|act'
  protected artifactLabel: string
  protected targetEntity = 'Action'
  protected artifactGroupDirLabel: CmmaArtifactDir = 'actions'

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    /**
     * Compute Name. Delete Prefix if included in argument
     */

    this.artifactLabel = this.name

    const actionTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'action',
        configObject: this.PROJECT_CONFIG,
      })

    this.artifactLabel = CmmaConfigurationActions.transformLabel({
      transformations: actionTransformations,
      label: this.artifactLabel,
    })

    /*
     * Ensure the Action isn't already in module
     */
    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        systemMap: this.systemMap,
        artifactGroupLabel: 'actions',
        artifactLabel: this.computedNameWithSuffix,
      })
    ) {
      this.logger.warning(`${YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM} ${EXITING}`)
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(this.artifactLabel)} Artifact in ${this.colors.underline(
        this.systemLabel
      )} System in ${this.colors.underline(this.contextLabel)} Context.`
    )
    /**
     * Add Artifact to Project
     */
    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: this.artifactLabel,
      artifactGroupLabel: 'actions',
      systemMap: this.systemMap,
    })

    /**
     * Generate Controller
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
    //     artifactGroupLabel: 'actions',
    //   }).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
