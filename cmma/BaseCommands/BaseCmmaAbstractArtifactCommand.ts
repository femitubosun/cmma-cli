import { BaseCmmaArtifactCommand } from './BaseCmmaArtifactCommand'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaAbstractArtifact from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaFileActions from '../Actions/CmmaFileActions'

export abstract class BaseCmmaAbstractArtifactCommand extends BaseCmmaArtifactCommand {
  protected abstract abstractArtifact: CmmaAbstractArtifact
  protected abstract artifactStubs: Record<CmmaArtifactType, string>
  protected abstract templateData: Record<string, any>
  protected abstract destinationDirs: Record<string, string>
  protected artifactGroupLabel: CmmaArtifactGroupLabel = 'operations'

  protected getAbstractArtifactTransformations(artifactGroup: CmmaArtifactGroupLabel) {
    return CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup,
      configObject: this.projectConfiguration!,
    })
  }

  protected getAbstractArtifactStub(artifactType: CmmaArtifactType) {
    const templatesDir = CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot)
    const artifactGroupTemplateFileName = this.artifactStubs[artifactType]

    templatesDir.push(artifactGroupTemplateFileName)

    return CmmaFileActions.joinPath(templatesDir)
  }

  protected getAbstractArtifactTemplateData(artifactType: CmmaArtifactType) {
    return this.templateData[artifactType]
  }

  protected getAbstractArtifactDestinationDir(artifactType: CmmaArtifactType) {
    return this.destinationDirs[artifactType]
  }

  public async generate() {
    const hasRcFile = await this.hasRcFile(this.application.appRoot)

    if (!hasRcFile) {
      this.logger.error('Make sure your project root has ".adonisrc.json" file')
      return
    }

    for (let artifact of this.abstractArtifact) {
      this.generator
        .addFile(
          this.artifactLabel,
          this.getAbstractArtifactTransformations(artifact.artifactGroup)
        )
        .stub(this.getAbstractArtifactStub(artifact.artifactType))
        .useMustache()
        .destinationDir(this.getAbstractArtifactDestinationDir(artifact.artifactType))
        .appRoot(this.application.appRoot)
        .apply(this.getAbstractArtifactTemplateData(artifact.artifactType))
    }

    await this.generator.run()
  }
}
