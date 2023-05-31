import { BaseCmmaCommand } from './BaseCmmaCommand'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaNodePath from '../Models/CmmaNodePath'

export abstract class BaseCmmaArtifactCommand extends BaseCmmaCommand {
  /**
   * CMMA Configurations
   */
  protected abstract artifactGroupLabel: CmmaArtifactGroupLabel
  protected abstract contextLabel: string
  protected abstract systemLabel: string
  protected abstract moduleLabel?: string
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

    const file = this.generator
      .addFile(this.artifactLabel, this.getArtifactTransformations())
      .stub(this.getArtifactStub())
      .useMustache()
      .destinationDir(this.getArtifactDestinationFilePath())
      .appRoot(this.application.appRoot)
      .apply(this.getTemplateData())

    await this.generator.run()
    return file
  }

  /**
   * @description Get the artifact's String Transformations
   * @protected
   */
  protected getArtifactTransformations() {
    return CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: this.artifactGroupLabel,
      configObject: this.PROJECT_CONFIG,
    })
  }

  /**
   * @description Get Artifact's template File
   * @protected
   * @author FATE
   */
  protected getArtifactStub() {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const artifactGroupTemplateFileName = `${this.artifactGroupLabel}.txt`

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
      computedNameWithSuffix: this.computedNameWithSuffix,
      computedNameWithoutSuffix: this.computedNameWithoutSuffix,
    }
  }

  /**
   * @description Get the Artifact's Destination Node Path e.g. 'User' Model would go to the 'Models' Directory
   * @protected
   * @author FATE
   */
  protected getArtifactDestinationNodePath() {
    return new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir(this.artifactGroupLabel)
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
        artifactGroup: this.artifactGroupLabel,
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
