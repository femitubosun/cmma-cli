import { BaseCmmaCommand } from './BaseCmmaCommand'
import CmmaArtifactDir from '../TypeChecking/CmmaArtifactDir'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaNodePath from '../Models/CmmaNodePath'

export abstract class BaseCmmaArtifactCommand extends BaseCmmaCommand {
  protected abstract artifactGroupDirLabel: CmmaArtifactDir
  protected abstract artifactLabel: string
  protected computedNameWithoutSuffix: string
  protected computedNameWithSuffix: string
  protected prefix: string

  /**
   * @description Artifact Generator
   * @protected
   * @author FATE
   */
  public async generate() {
    const hasRcFile = await this.hasRcFile(this.application.appRoot)

    if (!hasRcFile) {
      this.logger.error('Make sure your project root has ".adonisrc.json" file')
      return
    }

    this.generator
      .addFile(this.artifactLabel, this.getArtifactTransformations())
      .stub(this.getTemplateFileDir())
      .useMustache()
      .destinationDir(this.getArtifactDestinationFilePath())
      .appRoot(this.application.appRoot)
      .apply(this.getTemplateData())

    await this.generator.run()
  }

  /**
   * @description Get the artifact's String Transformations
   * @protected
   */
  protected getArtifactTransformations() {
    return CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: this.artifactGroupDirLabel,
      configObject: this.PROJECT_CONFIG,
    })
  }

  /**
   * @description Get Artifact's template File
   * @protected
   * @author FATE
   */
  protected getTemplateFileDir() {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const artifactGroupTemplateFileName = `${this.artifactGroupDirLabel}.txt`

    templatesDir.push(artifactGroupTemplateFileName)

    return CmmaFileActions.joinPath(templatesDir)
  }

  /**
   * @description Get Artifact's Template Data
   * @protected
   * @author FATE
   */
  protected getTemplateData(): any {
    return {
      artifactLabel: this.artifactLabel,
    }
  }

  /**
   * @description Get the Artifact's Destination Node Path e.g. 'User' Model would go to the 'Models' Directory
   * @protected
   * @author FATE
   */
  protected getArtifactDestinationNodePath() {
    return new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir(this.artifactGroupDirLabel)
  }

  /**
   * @description Get the Artifact's Destination File Path e.g. 'User' Model would go to the 'Models' Directory
   * @protected
   * @author FATE
   */
  protected getArtifactDestinationFilePath() {
    return this.getArtifactDestinationNodePath().getAbsoluteOsPath(this.application.appRoot)
  }

  /**
   * @description Get Artifact's Default Suffix
   * @protected
   * @author FATE
   */
  protected get defaultCmmaArtifactSuffix() {
    return (
      CmmaConfigurationActions.getArtifactGroupTransformation({
        configObject: this.PROJECT_CONFIG,
        artifactGroup: this.artifactGroupDirLabel,
      }).suffix || ''
    )
  }

  /**
   * Returns contents of the rcFile
   */
  protected async hasRcFile(cwd: string) {
    const filePath = CmmaFileActions.joinPath([cwd, '.adonisrc.json'])
    return CmmaFileActions.doesPathExist(filePath)
  }
}
