import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDir from '../../../cmma/TypeChecking/CmmaArtifactDir'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

export default class Validator extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-validator'
  public static description = 'Create a new CMMA Validator'
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
  @args.string({ description: 'Name of the Validator to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected projectMap = this.PROJECT_CONFIG.projectMap
  protected commandShortCode = 'mk|val'
  protected artifactLabel: string
  protected targetEntity = 'Validator'
  protected artifactGroupDirLabel: CmmaArtifactDir = 'validators'

  /*
  |--------------------------------------------------------------------------------
  | Get the Destination Node Path
  |--------------------------------------------------------------------------------
  |
  */
  protected getArtifactDestinationNodePath() {
    const nodePath = new CmmaNodePath(this.PROJECT_CONFIG)

    nodePath
      .drawPath()
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
        moduleMap: this.moduleMap,
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
      moduleMap: this.moduleMap,
    })

    /**
     * Generate Validator
     */
    await this.generate()

    /**
     * Finish Command
     */
    // this.commandArgs = [
    //   CmmaProjectMapActions.listContextsInProject(projectMap).length - 1,
    //   CmmaContextActions.listSystemsInContext(contextMap).length - 1,
    //   CmmaSystemActions.listModulesInSystem(systemMap).length - 1,
    //   CmmaModuleActions.listModuleValidators(moduleMap).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
