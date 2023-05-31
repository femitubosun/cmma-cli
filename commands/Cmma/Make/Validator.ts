import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

export default class Validator extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-validator'
  public static description = 'Create a new CMMA Validator'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the Validator to be Created' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|val'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'validators'

  protected getArtifactDestinationNodePath() {
    const nodePath = new CmmaNodePath(this.PROJECT_CONFIG)

    nodePath
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir(this.artifactGroupLabel)
      .toModule(this.moduleLabel)

    return nodePath
  }

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
      'What Context does this Validator belong to?',
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
      'What System does this Validator Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    const systemModules = CmmaSystemActions.listModulesInSystem(systemMap)

    if (!systemModules.length) {
      this.logger.error(
        `There are no defined Modules in Context. Run ${this.colors.cyan(
          'node ace cmma:make-module'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.moduleLabel = await this.prompt.choice(
      `What Module does this Validator belong to`,
      systemModules
    )

    const moduleMap = CmmaSystemActions.getModuleByLabel({
      moduleLabel: this.moduleLabel,
      systemMap,
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
     * Ensure the Validator isn't already in module
     */

    if (
      CmmaModuleActions.isValidatorInModule({
        moduleMap,
        validatorLabel: this.computedNameWithSuffix,
      })
    ) {
      this.logger.warning(
        `You have already registered Validator in this Module in System. Ignoring...`
      )
      await this.exit()
    }

    this.logger.info(
      `Creating ${this.colors.underline(this.computedNameWithSuffix)} ${
        this.artifactLabel
      } Artifact in ${this.colors.underline(this.moduleLabel)} Module in ${this.colors.underline(
        this.systemLabel
      )} System in ${this.colors.underline(this.contextLabel)} Context.`
    )

    CmmaModuleActions.addModuleValidatorToModule({
      validator: this.computedNameWithSuffix,
      module: moduleMap,
    })

    /**
     * Generate Validator
     */
    await this.generate()

    /**
     * Finish Command
     */
    this.commandArgs = [
      CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
      CmmaContextActions.listSystemsInContext(contextMap).length - 1,
      CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
      CmmaModuleActions.listModuleValidators(moduleMap).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
