import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDir from '../../../cmma/TypeChecking/CmmaArtifactDir'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import { YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM } from '../../../cmma/Helpers/SystemMessages'

export default class View extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-view'
  public static description = 'Create a new CMMA View'
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
  @args.string({ description: 'Name of the View to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|viw'
  protected artifactLabel: string
  protected targetEntity = 'View'
  protected artifactGroupDirLabel: CmmaArtifactDir = 'views'

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    /**
     * Transform View Label
     */
    this.artifactLabel = this.name

    const viewTransformation = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: this.artifactGroupDirLabel,
      configObject: this.PROJECT_CONFIG,
    })

    this.artifactLabel = CmmaConfigurationActions.transformLabel({
      label: this.name,
      transformations: viewTransformation,
      noExt: true,
    })

    /*
     * Ensure the View isn't already in System
     */
    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        systemMap: this.systemMap,
        artifactGroupLabel: 'views',
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
      artifact: this.computedNameWithSuffix,
      artifactGroupLabel: 'views',
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
    //     artifactGroupLabel: 'views',
    //   }).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
