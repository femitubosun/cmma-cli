import { BaseCmmaArtifactCommand } from '../../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import CmmaArtifactDirs from '../../../../cmma/TypeChecking/CmmaArtifactDirs'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../../cmma/Actions/CmmaConfigurationActions'
import CmmaNodePath from '../../../../cmma/Models/CmmaNodePath'
import CmmaFileActions from '../../../../cmma/Actions/CmmaFileActions'
import { NOT_CONFIRMED_EXITING } from '../../../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaContextActions from '../../../../cmma/Actions/CmmaContextActions'
import CmmaProjectMapActions from '../../../../cmma/Actions/CmmaProjectMapActions'
import CmmaSystemActions from '../../../../cmma/Actions/CmmaSystemActions'
import CmmaArtifactType from '../../../../cmma/TypeChecking/CmmaArtifactType'

export default class CreateOptions extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-create-options'
  public static description = 'Create a new CMMA Create Record Options'
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
  @args.string({ description: 'Name of the Model this Create Options is for' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|tyc'
  protected artifactLabel: string
  protected targetEntity = 'Create Options'
  protected artifactGroupDir: CmmaArtifactDirs = 'typeChecking'
  protected artifactType: CmmaArtifactType = 'create-options'

  /*
 |--------------------------------------------------------------------------------
 | Set the template data for Moustache
 |--------------------------------------------------------------------------------
 |
 */
  protected getTemplateData(): any {
    const interfaceImport = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir(this.artifactGroupDir)
      .toModelDir(this.artifactLabel)
      .toArtifactWithoutExtension({
        artifactLabel: `${this.artifactLabel}Interface`,
        artifactType: 'file',
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

  /*
  |--------------------------------------------------------------------------------
  | Get Artifact Template File
  |--------------------------------------------------------------------------------
  |
  */
  protected getTemplateFilePath(): string {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const createRecordTemplate = 'create-options.txt'

    templatesDir.push(createRecordTemplate)
    return CmmaFileActions.joinPath(templatesDir)
  }

  protected getArtifactDestinationFilePath(): string {
    return new CmmaNodePath(this.PROJECT_CONFIG)
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('typeChecking')
      .toModelDir(this.artifactLabel)
      .getAbsoluteOsPath(this.application.appRoot)
  }

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

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
      artifactType: 'model',
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
      )} System of ${this.colors.underline(modelSystemPath.contextLabel!)} Context`
    )

    const confirm = await this.prompt.confirm(
      `Make ${this.colors.underline(
        `Create${this.artifactLabel}RecordOptions`
      )} in ${this.colors.underline(modelSystemPath.systemLabel!)} System?`
    )

    if (!confirm) {
      this.logger.info(NOT_CONFIRMED_EXITING)
      await this.exit()
    }

    this.contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel: this.contextLabel,
      projectMap: this.projectMap,
    })

    this.systemMap = CmmaContextActions.getContextSystemMapByLabel({
      systemLabel: this.systemLabel,
      contextMap: this.contextMap,
    })

    const artifact = CmmaConfigurationActions.transformLabel({
      label: this.artifactLabel,
      transformations: CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'create-options',
        configObject: this.PROJECT_CONFIG,
      }),
    })

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact,
      artifactsDir: 'typeChecking',
      systemMap: this.systemMap,
    })

    await this.generate()

    this.commandArgs = [
      CmmaProjectMapActions.getContextIndexByLabel({
        projectMap: this.projectMap,
        contextLabel: this.contextLabel,
      }),
      CmmaContextActions.getSystemIndexByLabel({
        contextMap: this.contextMap,
        systemLabel: this.systemLabel,
      }),
      CmmaSystemActions.listSystemArtifactsByGroupLabel({
        systemMap: this.systemMap,
        artifactsDir: this.artifactGroupDir,
      }).length - 1,
    ]

    this.finishCmmaCommand()
  }
}
