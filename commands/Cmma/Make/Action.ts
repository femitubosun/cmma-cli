import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'

export default class Action extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-action'
  public static description = 'Create a new CMMA Action'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the Action to be Created' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|act'
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'actions'

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
      'What Context does this Action belong to?',
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
      'What System does this Action Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemMapByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    /**
     * Compute Name. Delete Prefix if included in argument
     */

    this.artifactLabel = this.name

    const precomputedName = CmmaConfigurationActions.normalizeProjectIdentifier({
      configObject: this.PROJECT_CONFIG!,
      identifier: this.name,
    })

    this.computedNameWithoutSuffix = precomputedName.includes(this.defaultCmmaArtifactSuffix)
      ? precomputedName.replace(this.defaultCmmaArtifactSuffix, '')
      : precomputedName

    this.computedNameWithSuffix = CmmaConfigurationActions.normalizeProjectIdentifier({
      configObject: this.PROJECT_CONFIG!,
      identifier: this.computedNameWithoutSuffix + this.defaultCmmaArtifactSuffix,
    })

    /*
     * Ensure the Action isn't already in module
     */
    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        systemMap,
        artifactGroupLabel: 'actions',
        artifactLabel: this.computedNameWithSuffix,
      })
    ) {
      this.logger.warning(`You have already registered Action in this System. Ignoring...`)
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(
        this.computedNameWithSuffix
      )} Artifact in ${this.colors.underline(this.systemLabel)} System in ${this.colors.underline(
        this.contextLabel
      )} Context.`
    )

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: this.computedNameWithSuffix,
      artifactGroupLabel: 'actions',
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
        artifactGroupLabel: 'actions',
      }).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
