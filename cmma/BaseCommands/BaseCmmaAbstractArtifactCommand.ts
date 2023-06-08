import { BaseCmmaArtifactCommand } from './BaseCmmaArtifactCommand'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'
import CmmaAbstractArtifact from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaAbstractArtifactEnum from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactEnum'
import CmmaAbstractArtifactTemplates from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactTemplates'
import CmmaAbstractArtifactTemplateData from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactTemplateData'
import CmmaAbstractArtifactDestinationDir from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactDestinationDir'
import CmmaAbstractArtifactTransformations from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactTransformations'
import CmmaStringTransformations from '../TypeChecking/CmmaStringTransformations'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaSystemActions from '../Actions/CmmaSystemActions'
import { EXITING } from '../Helpers/SystemMessages/SystemMessages'
import CmmaNodePath from '../Models/CmmaNodePath'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

/*
|--------------------------------------------------------------------------------
| The Base Command for Abstract Artifacts.
|
| The Process an Abstract Command should follow goes like so
|
|
|- Define base CMMA Command Configs
|
|- Set constituent artifacts in this.abstractArtifact
|
|- Set this.artifactLabel to common name
|
| - Ensure any of the artifacts isn't already existing
|
|- Set the destination data for each constituent artifact with
| this.setArtifactDestinationDir({artifactType, destinationDir})
|
|- Set the template data for each constituent with this.setArtifactTemplateData({artifactType, templateData})
|
|- Call .generate()
|--------------------------------------------------------------------------------
|
*/
export abstract class BaseCmmaAbstractArtifactCommand extends BaseCmmaArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | General name for Abstract Artifact
  |--------------------------------------------------------------------------------
  |
  */

  // Defaulting as it's not relevant
  protected artifactType: CmmaArtifactType = 'file'
  protected artifactGroupDir: CmmaArtifactDirs = 'actions'

  /*
  |--------------------------------------------------------------------------------
  | Definition of the Artifacts in the Abstract Artifact
  |--------------------------------------------------------------------------------
  |
  */
  protected abstract abstractArtifactConstituents: CmmaAbstractArtifact
  protected abstract abstractArtifactType: CmmaAbstractArtifactEnum

  /*
  |--------------------------------------------------------------------------------
  | Definition of the template files
  |--------------------------------------------------------------------------------
  |
  */
  protected artifactTemplates: CmmaAbstractArtifactTemplates = {
    'operation': {
      controller: 'operation-controllers.txt',
      validator: 'operation-validators.txt',
    },
    'model-options': {
      'create-typechecking': 'model-options-create-typechecking.txt',
      'update-typechecking': 'model-options-update-typechecking.txt',
      'identifier-options': 'model-options-identifier-typechecking.txt',
      'model-interface': 'model-options-model-interface.txt',
    },
    'db-model': {
      model: 'db-model/model.txt',
      migration: 'db-model/migration-make.txt',
    },
    'resource': {
      'model': 'resource-model.txt',
      'action': 'resource-action.txt',
      'model-options': '',
      'migration': '',
    },
  }

  /*
  |--------------------------------------------------------------------------------
  | Definition of the data Mustache uses when generating files
  |--------------------------------------------------------------------------------
  |
  */
  protected templateData: CmmaAbstractArtifactTemplateData = {
    'operation': {
      controller: {},
      validator: {},
    },
    'model-options': {
      'create-typechecking': {},
      'update-typechecking': {},
      'identifier-options': {},
      'model-interface': {},
    },
    'db-model': {
      model: {},
      migration: {},
    },
    'resource': {
      'db-model': {},
      'model-options': {},
      'action': {},
    },
  }

  /*
  |--------------------------------------------------------------------------------
  | Definition of the destination directories
  |--------------------------------------------------------------------------------
  |
  */
  protected destinationDirs: CmmaAbstractArtifactDestinationDir = {
    'operation': {
      controller: '',
      validator: '',
    },
    'model-options': {
      'create-typechecking': '',
      'update-typechecking': '',
      'identifier-options': '',
      'model-interface': '',
    },
    'db-model': {
      model: '',
      migration: '',
    },
    'resource': {
      'model': '',
      'action': '',
      'model-options': '',
      'migration': '',
    },
  }

  protected abstractArtifactTransformations: CmmaAbstractArtifactTransformations = {
    'operation': {
      controller: {},
      validator: {},
    },
    'model-options': {
      'create-typechecking': {},
      'update-typechecking': {},
      'identifier-options': {},
      'model-interface': {},
    },
    'db-model': {
      model: {},
      migration: {},
    },
    'resource': {
      'db-model': {},
      'model-options': {},
      'action': {},
    },
  }

  /**
   * @description Get an Artifact's Template's File Path
   * @protected
   * @author FATE
   * @param artifactType
   * @returns StringTransformations
   */
  protected getArtifactTemplateFileDir(artifactType: CmmaArtifactType) {
    const artifactTemplateFilename = this.artifactTemplates[this.abstractArtifactType][artifactType]

    const templateDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)

    templateDir.push(artifactTemplateFilename)

    return CmmaFileActions.joinPath(templateDir)
  }

  /**
   * @description Set an Artifact's Template Data
   * @param setAbstractArtifactTemplateDataOptions
   * @protected
   * @returns void
   * @author FATE
   */
  protected setArtifactTemplateData(setAbstractArtifactTemplateDataOptions: {
    artifactType: CmmaArtifactType
    templateData: Record<string, any>
  }) {
    const { artifactType, templateData } = setAbstractArtifactTemplateDataOptions

    this.templateData[this.abstractArtifactType][artifactType] = templateData
  }

  /**
   * @description Get an Artifact's Template Data
   * @protected
   * @returns void
   * @author FATE
   * @param artifactType
   */
  protected getArtifactTemplateData(artifactType: CmmaArtifactType) {
    return this.templateData[this.abstractArtifactType][artifactType]
  }

  /**
   * @description Set an Artifact's Destination Directory
   * @protected
   * @returns void
   * @author FATE
   * @param setArtifactDestinationDirOptions
   */
  protected setArtifactDestinationDir(setArtifactDestinationDirOptions: {
    artifactType: CmmaArtifactType
    destinationDir: string
  }) {
    const { artifactType, destinationDir } = setArtifactDestinationDirOptions

    this.destinationDirs[this.abstractArtifactType][artifactType] = destinationDir
  }

  /**
   * @description Set an Artifact's Destination Directory
   * @protected
   * @returns void
   * @author FATE
   * @param artifactType
   */
  protected getArtifactDestinationDir(artifactType: CmmaArtifactType) {
    console.log(this.destinationDirs[this.abstractArtifactType])
    console.log(this.destinationDirs[this.abstractArtifactType][artifactType])
    return this.destinationDirs[this.abstractArtifactType][artifactType]
  }

  /**
   * @description Set an Artifact's Transformation
   * @protected
   * @returns void
   * @author FATE
   * @param setArtifactDestinationDirOptions
   */
  protected setAbstractArtifactTransformation(setArtifactDestinationDirOptions: {
    artifactType: CmmaArtifactType
    transformation: CmmaStringTransformations
  }) {
    const { artifactType, transformation } = setArtifactDestinationDirOptions

    this.abstractArtifactTransformations[this.abstractArtifactType][artifactType] = transformation
  }

  /**
   * @description Set an Artifact's Transformation
   * @protected
   * @returns void
   * @author FATE
   * @param artifactType
   */
  protected getAbstractArtifactTransformation(artifactType: CmmaArtifactType) {
    return this.abstractArtifactTransformations[this.abstractArtifactType][artifactType]
  }

  /**
   * @description Add Artifacts to Project Map Step
   * @protected
   * @returns void
   * @author FATE
   */
  protected async addArtifactsToProjectMapCommandStep() {
    for (let artifact of this.abstractArtifactConstituents) {
      const artifactTranformationsWithoutExtension =
        CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
          artifactType: artifact,
          configObject: this.PROJECT_CONFIG,
        })

      const artifactLabel = CmmaConfigurationActions.transformLabel({
        label: this.artifactLabel,
        transformations: artifactTranformationsWithoutExtension,
      })

      const artifactsDir = CmmaConfigurationActions.getDefaultArtifactTypeDir(artifact)

      if (
        CmmaSystemActions.isArtifactInSystemArtifactGroup({
          artifactLabel: artifactLabel,
          artifactsDir,
          systemMap: this.systemMap,
        })
      ) {
        this.logger.error(`${artifactLabel} already exists in ${this.systemLabel}. ${EXITING}`)

        await this.exit()
      }
    }
  }

  protected async setArtifactsTransformationsCommandStep() {
    for (let artifact of this.abstractArtifactConstituents) {
      const artifactTransformations =
        CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
          artifactType: artifact,
          configObject: this.PROJECT_CONFIG,
        })

      if (artifact === 'migration') {
        artifactTransformations.prefix = `${new Date().getTime()}_`
      }

      this.setAbstractArtifactTransformation({
        artifactType: artifact,
        transformation: artifactTransformations,
      })
    }
  }

  protected async setArtifactDestinationPathCommandStep() {
    for (let artifactType of this.abstractArtifactConstituents) {
      const artifactDestinationPath = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(this.contextLabel)
        .toSystem(this.systemLabel)
        .toArtifactsDir(CmmaConfigurationActions.getDefaultArtifactTypeDir(artifactType))
        .getAbsoluteOsPath(this.application.appRoot)

      this.setArtifactDestinationDir({ artifactType, destinationDir: artifactDestinationPath })
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Generate Artifacts
  |--------------------------------------------------------------------------------
  |
  */
  public async generate() {
    const hasRcFile = await this.hasRcFile(this.application.appRoot)

    if (!hasRcFile) {
      this.logger.error('Make sure your project root has ".adonisrc.json" file')
      return
    }

    this.abstractArtifactConstituents.forEach((artifact) => {
      const artifactTransformation = this.getAbstractArtifactTransformation(artifact)
      const templateFile = this.getArtifactTemplateFileDir(artifact)
      const destinationDir = this.getArtifactDestinationDir(artifact)

      console.log(this.application.appRoot)
      this.generator
        .addFile(this.artifactLabel, artifactTransformation)
        .stub(templateFile)
        .useMustache()
        .destinationDir(destinationDir)
        .appRoot(this.application.appRoot)
        .apply(this.getArtifactTemplateData(artifact))
    })

    await this.generator.run()
  }
}
