import { BaseCmmaArtifactCommand } from '../../../cmma/CommandBase/BaseCmmaArtifactCommand'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaNodeMap from '../../../cmma/Models/CmmaNodeMap'

export default class CreateOptions extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-create-options'
  public static description = 'Create a new CMMA Create Record TypeChecking'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the model this Create TypeChecking is for' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|typ-c'
  protected PROJECT_CONFIG = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'typechecking'

  public async run() {
    await this.startCmmaCommand()

    const modelTransformations = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: 'models',
      configObject: this.PROJECT_CONFIG,
    })

    const modelName = CmmaConfigurationActions.transformLabel({
      label: this.name,
      transformations: modelTransformations,
      noExt: true,
    })

    const modelSystemPath = new CmmaNodeMap(this.PROJECT_CONFIG).findArtifactInProject({
      artifactType: 'models',
      artifactLabel: modelName,
    })

    if (modelSystemPath.length === 0) {
      this.logger.error(`Model ${modelName} is not available in project`)

      await this.exit()
    }

    this.logger.info(
      `Found ${this.colors.underline(modelName)} Model in ${this.colors.underline(
        modelSystemPath.systemLabel!
      )} System`
    )

    const confirm = await this.prompt.confirm(
      `Make ${this.colors.underline(`Create${modelName}RecordOptions`)} in ${this.colors.underline(
        modelSystemPath.systemLabel!
      )} System?`
    )

    this.logger.success(confirm ? 'Okay. Create' : 'Byeee')

    /**
     * Ask Model
     */
    // List Models in Project
    //   Select Model
    //   Find its system

    //   Create TypeChecking in there.

    // const nodePath = new CmmaNodeMap(this.PROJECT_CONFIG).findArtifactInProject()

    this.finishCmmaCommand()
  }
}
