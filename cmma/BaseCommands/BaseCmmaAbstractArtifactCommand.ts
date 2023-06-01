import { BaseCmmaArtifactCommand } from './BaseCmmaArtifactCommand'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaAbstractArtifact from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaFileActions from '../Actions/CmmaFileActions'

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
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'operations'

  /*
  |--------------------------------------------------------------------------------
  | Definition of the Artifacts in the Abstract Artifact
  |--------------------------------------------------------------------------------
  |
  */
  protected abstract abstractArtifact: CmmaAbstractArtifact

  /*
  |--------------------------------------------------------------------------------
  | Definition of the template files
  |--------------------------------------------------------------------------------
  |
  */
  // refactor key -> shit
  protected artifactTemplates: Record<CmmaArtifactType, string> = {
    'controller': 'operation-controllers.txt',
    'validator': 'operation-validators.txt',
    'view': '',
    'create-typechecking': 'model-options-create-typechecking.txt',
    'update-typechecking': 'model-options-update-typechecking.txt',
    'identifier-options': 'model-options-identifier-typechecking.txt',
    'model-interface': 'model-options-model-interface.txt',
    'file': '',
    'model': '',
    'migration': '',
    'action': '',
    'route': '',
    'index': '',
  }

  /*
  |--------------------------------------------------------------------------------
  | Definition of the data Mustache uses when generating files
  |--------------------------------------------------------------------------------
  |
  */
  protected templateData: Record<CmmaArtifactType, Record<string, any>> = {
    'controller': {},
    'validator': {},
    'view': {},
    'create-typechecking': {},
    'update-typechecking': {},
    'identifier-options': {},
    'model-interface': {},
    'file': {},
    'model': {},
    'migration': {},
    'action': {},
    'route': {},
    'index': {},
  }

  /*
  |--------------------------------------------------------------------------------
  | Definition of the destination directories
  |--------------------------------------------------------------------------------
  |
  */
  protected destinationDirs: Record<CmmaArtifactType, string> = {
    'controller': '',
    'validator': '',
    'view': '',
    'create-typechecking': '',
    'update-typechecking': '',
    'identifier-options': '',
    'model-interface': '',
    'file': '',
    'model': '',
    'migration': '',
    'action': '',
    'route': '',
    'index': '',
  }

  /**
   * @description Get an Artifact's Template's File Path
   * @protected
   * @author FATE
   * @param artifactType
   * @returns StringTransformations
   */
  protected getArtifactTemplateFile(artifactType: CmmaArtifactType) {
    const artifactTemplateFilename = this.artifactTemplates[artifactType]

    const templateDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)

    templateDir.push(artifactTemplateFilename)

    return CmmaFileActions.joinPath(templateDir)
  }

  /**
   * @description Set an Artifact's Template Data
   * @protected
   * @author FATE
   * @param artifactType
   * @returns StringTransformations
   */
  protected getAbstractArtifactTransformations(artifactType: CmmaArtifactType) {
    return CmmaConfigurationActions.getArtifactTypeTransformationWithExtension({
      artifactType,
      configObject: this.projectConfiguration!,
    })
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

    this.templateData[artifactType] = templateData
  }

  /**
   * @description Get an Artifact's Template Data
   * @protected
   * @returns void
   * @author FATE
   * @param artifactType
   */
  protected getArtifactTemplateData(artifactType: CmmaArtifactType) {
    return this.templateData[artifactType]
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

    return (this.destinationDirs[artifactType] = destinationDir)
  }

  /**
   * @description Set an Artifact's Destination Directory
   * @protected
   * @returns void
   * @author FATE
   * @param artifactType
   */
  protected getArtifactDestinationDir(artifactType: CmmaArtifactType) {
    return this.destinationDirs[artifactType]
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

    this.abstractArtifact.forEach((artifact) => {
      this.generator
        .addFile(this.artifactLabel, this.getAbstractArtifactTransformations(artifact))
        .stub(this.getArtifactTemplateFile(artifact))
        .useMustache()
        .destinationDir(this.getArtifactDestinationDir(artifact))
        .appRoot(this.application.appRoot)
        .apply(this.getArtifactTemplateData(artifact))
    })

    await this.generator.run()
  }
}
