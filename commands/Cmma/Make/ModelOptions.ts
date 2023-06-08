import { BaseCmmaAbstractArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaAbstractArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaAbstractArtifact from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import { EXITING } from '../../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaArtifactType from '../../../cmma/TypeChecking/CmmaArtifactType'
import CmmaArtifactDirs from '../../../cmma/TypeChecking/CmmaArtifactDirs'
import CmmaAbstractArtifactEnum from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifactEnum'

/*
|--------------------------------------------------------------------------------
| Operation Abstract Artifact
|
| Constituents: 'controller', 'validator'
|--------------------------------------------------------------------------------
|
*/
export default class ModelOptions extends BaseCmmaAbstractArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-model-options'
  public static description = 'Create a new CMMA Model Options'
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
  @args.string({ description: 'Name of the Model the Model Options to be Created belongs to' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Specific Configurations
  |--------------------------------------------------------------------------------
  |
  */
  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|mop'
  protected artifactLabel: string
  protected abstractArtifactType: CmmaAbstractArtifactEnum = 'model-options'
  protected targetEntity = 'Model Options'
  protected artifactType: CmmaArtifactType = 'file'
  protected artifactGroupDir: CmmaArtifactDirs = 'typeChecking'

  protected abstractArtifactConstituents: CmmaAbstractArtifact = [
    'create-typechecking',
    'update-typechecking',
    'model-interface',
    'identifier-options',
  ]

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    const projectMap = this.PROJECT_CONFIG.projectMap

    this.artifactLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: this.name,
      configObject: this.PROJECT_CONFIG,
    })

    const modelNodePath = new CmmaNodePath(this.PROJECT_CONFIG).findArtifactInProject({
      artifactLabel: this.artifactLabel,
      artifactType: 'model',
    })

    if (!modelNodePath.length) {
      this.logger.error(`${this.artifactLabel} Model Not Found in Project ${EXITING}`)

      await this.exit()
    }

    const confirmation = await this.prompt.confirm(
      `${this.colors.underline(this.artifactLabel)} Model found in ${this.colors.underline(
        modelNodePath.systemLabel!
      )} System in ${this.colors.underline(modelNodePath.contextLabel!)} Context. Create ${
        this.name
      } Model Options in System?`
    )

    if (!confirmation) {
      this.logger.info(EXITING)

      await this.exit()
    }

    this.contextLabel = modelNodePath.contextLabel!
    this.systemLabel = modelNodePath.systemLabel!

    this.contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel: this.contextLabel,
      projectMap,
    })

    this.systemMap = CmmaContextActions.getContextSystemMapByLabel({
      systemLabel: this.systemLabel,
      contextMap: this.contextMap,
    })

    /**
     * Add Artifacts to project
     */

    const createOptionsTransformation =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'create-typechecking',
        configObject: this.PROJECT_CONFIG,
      })

    const createOptionsLabel = CmmaConfigurationActions.transformLabel({
      transformations: createOptionsTransformation,
      label: this.artifactLabel,
    })

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: createOptionsLabel,
        artifactsDir: 'typeChecking',
        systemMap: this.systemMap,
      })
    ) {
      this.logger.error(`${createOptionsLabel} already exists in ${this.systemLabel}. ${EXITING}`)

      await this.exit()
    }

    const updateOptionsTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'update-typechecking',
        configObject: this.PROJECT_CONFIG,
      })

    const updateOptionsLabel = CmmaConfigurationActions.transformLabel({
      transformations: updateOptionsTransformations,
      label: this.artifactLabel,
    })

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: updateOptionsLabel,
        artifactsDir: 'typeChecking',
        systemMap: this.systemMap,
      })
    ) {
      this.logger.error(`${updateOptionsLabel} already exists in ${this.systemLabel}. ${EXITING}`)

      await this.exit()
    }

    const identifierOptionsTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'identifier-options',
        configObject: this.PROJECT_CONFIG,
      })

    const identifierOptionsLabel = CmmaConfigurationActions.transformLabel({
      transformations: identifierOptionsTransformations,
      label: this.artifactLabel,
    })

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: identifierOptionsLabel,
        artifactsDir: 'typeChecking',
        systemMap: this.systemMap,
      })
    ) {
      this.logger.error(
        `${identifierOptionsLabel} already exists in ${this.systemLabel}. ${EXITING}`
      )

      await this.exit()
    }

    const modelInterfaceTransformations =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'model-interface',
        configObject: this.PROJECT_CONFIG,
      })

    const modelInterfaceLabel = CmmaConfigurationActions.transformLabel({
      transformations: modelInterfaceTransformations,
      label: this.artifactLabel,
    })

    if (
      CmmaSystemActions.isArtifactInSystemArtifactGroup({
        artifactLabel: modelInterfaceLabel,
        artifactsDir: 'typeChecking',
        systemMap: this.systemMap,
      })
    ) {
      this.logger.error(`${modelInterfaceLabel} already exists in ${this.systemLabel}. ${EXITING}`)

      await this.exit()
    }

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifactsDir: 'typeChecking',
      artifact: createOptionsLabel,
      systemMap: this.systemMap,
    })

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifactsDir: 'typeChecking',
      artifact: updateOptionsLabel,
      systemMap: this.systemMap,
    })

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifactsDir: 'typeChecking',
      artifact: identifierOptionsLabel,
      systemMap: this.systemMap,
    })

    CmmaSystemActions.addArtifactToArtifactGroup({
      artifactsDir: 'typeChecking',
      artifact: modelInterfaceLabel,
      systemMap: this.systemMap,
    })

    // CmmaSystemActions.addAbstractArtifactToAbstractArtifactGroup({
    //   abstractArtifactGroupLabel: 'model-options',
    //   abstractArtifact: identifierOptionsLabel,
    //   systemMap: this.systemMap,
    // })

    /**
     * Setting Destination Dirs
     */

    const typecheckingDestinationNodePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('typeChecking')
      .toModelDir(this.artifactLabel)

    const typecheckingDestinationDir = typecheckingDestinationNodePath.getAbsoluteOsPath(
      this.application.appRoot
    )

    this.setArtifactDestinationDir({
      artifactType: 'create-typechecking',
      destinationDir: typecheckingDestinationDir,
    })

    this.setArtifactDestinationDir({
      artifactType: 'update-typechecking',
      destinationDir: typecheckingDestinationDir,
    })

    this.setArtifactDestinationDir({
      artifactType: 'identifier-options',
      destinationDir: typecheckingDestinationDir,
    })

    this.setArtifactDestinationDir({
      artifactType: 'model-interface',
      destinationDir: typecheckingDestinationDir,
    })

    const templateData = {
      identifierOptionsLabel,
      modelInterfaceLabel,
      defaultProjectDir: this.PROJECT_CONFIG.defaultProjectRootDirInApp,
      contextLabel: this.contextLabel,
      systemLabel: this.systemLabel,
      artifactDirLabel: typecheckingDestinationNodePath.artifactDirLabel,
      artifactLabel: this.artifactLabel,
    }

    this.setArtifactTemplateData({
      artifactType: 'create-typechecking',
      templateData,
    })

    this.setArtifactTemplateData({
      artifactType: 'update-typechecking',
      templateData,
    })

    await this.generate()

    // this.commandArgs = [
    //   CmmaProjectMapActions.getContextIndexByLabel({
    //     projectMap: this.projectMap,
    //     contextLabel: this.contextLabel,
    //   }),
    //   CmmaContextActions.getSystemIndexByLabel({
    //     contextMap: this.contextMap,
    //     systemLabel: this.systemLabel,
    //   }),
    //   CmmaSystemActions.listSystemAbstractArtifactsByGroupLabel({
    //     systemMap: this.systemMap,
    //     abstractArtifactGroupLabel: this.abstractArtifactType,
    //   }).length - 1,
    // ]

    this.finishCmmaCommand()
  }
}
