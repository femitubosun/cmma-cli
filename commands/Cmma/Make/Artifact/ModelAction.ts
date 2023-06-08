import { BaseCmmaArtifactCommand } from '../../../../cmma/BaseCommands/BaseCmmaArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfiguration from '../../../../cmma/Models/CmmaConfiguration'
import CmmaSystemActions from '../../../../cmma/Actions/CmmaSystemActions'
import CmmaConfigurationActions from '../../../../cmma/Actions/CmmaConfigurationActions'
import CmmaArtifactDirs from '../../../../cmma/TypeChecking/CmmaArtifactDirs'
import { NOT_CONFIRMED_EXITING } from '../../../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaArtifactType from '../../../../cmma/TypeChecking/CmmaArtifactType'
import CmmaProjectMapActions from '../../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../../cmma/Actions/CmmaContextActions'
import CmmaFileActions from '../../../../cmma/Actions/CmmaFileActions'
import CmmaNodePath from '../../../../cmma/Models/CmmaNodePath'

export default class ModelAction extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-model-action'
  public static description = 'Create a new CMMA Model Action'
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
  @args.string({ description: 'Name of the Model this Action is for' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|mac'
  protected artifactLabel: string
  protected targetEntity = 'Action'
  protected artifactGroupDir: CmmaArtifactDirs = 'actions'
  protected artifactType: CmmaArtifactType = 'action'

  /**
   * @description Get Artifact's template File
   * @protected
   * @author FATE
   */
  protected getTemplateFilePath() {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const artifactTemplateFileName = `model-action.txt`

    templatesDir.push(artifactTemplateFileName)

    return CmmaFileActions.joinPath(templatesDir)
  }

  /**
   * @description Get Artifact's Template Data
   * @protected
   * @author FATE
   */
  protected getTemplateData(): any {
    const modelVariableName = CmmaConfigurationActions.transformLabel({
      label: this.artifactLabel,
      transformations: { pattern: 'camelcase' },
    })

    const typeCheckingArtifactDirLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: 'typeChecking',
      configObject: this.PROJECT_CONFIG,
    })

    const modelNameInCaps = CmmaConfigurationActions.transformLabel({
      label: this.artifactLabel,
      transformations: {
        pattern: 'snakecase',
      },
    }).toUpperCase()

    return {
      modelName: this.artifactLabel,
      projectRootDir: CmmaConfigurationActions.whatIsDefaultProjectRootInApp(this.PROJECT_CONFIG),
      contextLabel: this.contextLabel,
      systemLabel: this.systemLabel,
      typeCheckingArtifactDirLabel,
      modelVariableName,
      modelNameInCaps,
    }
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

    const modelActionTransformation =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'action',
        configObject: this.PROJECT_CONFIG,
      })

    const modelActionLabel = CmmaConfigurationActions.transformLabel({
      transformations: modelActionTransformation,
      label: this.artifactLabel,
    })

    const confirm = await this.prompt.confirm(
      `Make ${this.colors.underline(modelActionLabel)} in ${this.colors.underline(
        modelSystemPath.systemLabel!
      )} System?`
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

    /**
     * Add Artifact to Project
     */
    CmmaSystemActions.addArtifactToArtifactGroup({
      artifact: modelActionLabel,
      artifactsDir: 'actions',
      systemMap: this.systemMap,
    })

    /**
     * Generate Artifact
     */
    await this.generate()

    /**
     * Finish Command
     */
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
