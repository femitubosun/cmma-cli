import { BaseCmmaArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import CmmaArtifactGroupLabel from '../../../cmma/TypeChecking/CmmaArtifactGroupLabel'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'

export default class UpdateOptions extends BaseCmmaArtifactCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-update-options'
  public static description = 'Create a new CMMA Update Record TypeChecking'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the model this Update TypeChecking is for' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|tyu'
  protected PROJECT_CONFIG = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'update-typechecking'

  /**
   * Artifact Specifics
   */

  protected getTemplateData(): any {
    const interfaceImport = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('typechecking')
      .toModelDir(this.artifactLabel)
      .toArtifactWithExtension({
        artifactLabel: `${this.artifactLabel}Interface`,
        artifactType: 'file',
        noExt: true,
      })

    return {
      artifactLabel: this.artifactLabel,
      defaultProjectDir: this.PROJECT_CONFIG.defaultProjectRootDirInApp,
      contextLabel: this.contextLabel,
      systemLabel: this.systemLabel,
      artifactDirLabel: interfaceImport.artifactDirLabel,
      interfaceImport: interfaceImport,
    }
  }

  protected getArtifactStub(): string {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const createRecordTemplate = 'update-record.txt'

    templatesDir.push(createRecordTemplate)
    return CmmaFileActions.joinPath(templatesDir)
  }

  protected getArtifactDestinationFilePath(): string {
    return new CmmaNodePath(this.PROJECT_CONFIG)
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('typechecking')
      .toModelDir(this.artifactLabel)
      .getAbsoluteOsPath(this.application.appRoot)
  }

  public async run() {
    await this.startCmmaCommand()

    const modelTransformations = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: 'models',
      configObject: this.PROJECT_CONFIG,
    })

    this.artifactLabel = CmmaConfigurationActions.transformLabel({
      label: this.name,
      transformations: modelTransformations,
      noExt: true,
    })

    const modelSystemPath = new CmmaNodePath(this.PROJECT_CONFIG).findArtifactInProject({
      artifactGroup: 'models',
      artifactLabel: this.artifactLabel,
    })

    if (modelSystemPath.length === 0) {
      this.logger.error(`Model ${this.artifactLabel} is not available in project`)

      await this.exit()
    }

    this.systemLabel = modelSystemPath.systemLabel!
    this.contextLabel = modelSystemPath.contextLabel!

    this.logger.info(
      `Found ${this.colors.underline(this.artifactLabel)} Model in ${this.colors.underline(
        modelSystemPath.systemLabel!
      )} System of ${this.colors.underline(modelSystemPath.contextLabel!)}`
    )

    const confirm = await this.prompt.confirm(
      `Make ${this.colors.underline(
        `Create${this.artifactLabel}RecordOptions`
      )} in ${this.colors.underline(modelSystemPath.systemLabel!)} System?`
    )

    this.logger.success(confirm ? 'Okay. Create' : 'Byeee')

    await this.generate()

    this.finishCmmaCommand()
  }
}
