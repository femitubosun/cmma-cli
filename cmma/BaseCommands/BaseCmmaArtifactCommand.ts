import { BaseCmmaCommand } from './BaseCmmaCommand'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaNodePath from '../Models/CmmaNodePath'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

export abstract class BaseCmmaArtifactCommand extends BaseCmmaCommand {
  protected abstract artifactType: CmmaArtifactType
  protected abstract artifactGroupDir: CmmaArtifactDirs
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
    return CmmaConfigurationActions.getArtifactTypeTransformationWithExtension({
      artifactType: this.artifactType,
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
    const artifactGroupTemplateFileName = `${this.artifactType}.txt`

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
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir(this.artifactGroupDir)
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
      CmmaConfigurationActions.getArtifactTypeTransformationWithExtension({
        configObject: this.PROJECT_CONFIG,
        artifactType: this.artifactType,
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
