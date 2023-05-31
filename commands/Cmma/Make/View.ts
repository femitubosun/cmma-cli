import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'

export default class View extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-view'
  public static description = 'Create a new CMMA View'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the View to be Created' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|viw'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'views'

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
      'What Context does this View belong to?',
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
      'What System does this View Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    /**
     * Compute Name. Delete Prefix if included in argument
     */
    // TODO
    this.artifactLabel = this.name

    const viewTransformation = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: this.artifactGroupLabel,
      configObject: this.PROJECT_CONFIG,
    })

    const viewName = CmmaConfigurationActions.transformLabel({
      label: this.name,
      transformations: viewTransformation,
      noExt: true,
    })

    this.computedNameWithoutSuffix = viewName

    this.computedNameWithSuffix = viewName

    /*
     * Ensure the Action isn't already in module
     */

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        systemMap,
        artifactGroupLabel: 'views',
        artifactLabel: this.computedNameWithSuffix,
      })
    ) {
      this.logger.warning(`You have already registered View in this System. Ignoring...`)
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(this.computedNameWithSuffix)} ${
        this.artifactLabel
      } Artifact in ${this.colors.underline(this.systemLabel)} System in ${this.colors.underline(
        this.contextLabel
      )} Context.`
    )

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: this.computedNameWithSuffix,
      artifactGroupLabel: 'views',
      systemMap,
    })

    /**
     * Generate Controller
     */
    await this.generate()

    /**
     * Finish Command
     */
    this.commandArgs = [
      CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
      CmmaContextActions.listSystemsInContext(contextMap).length - 1,
      CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
      CmmaSystemActions.listSystemArtifactsByGroupLabel({
        systemMap,
        artifactGroupLabel: 'views',
      }).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
