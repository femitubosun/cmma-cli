import CmmaArtifactLabelObject from '../TypeChecking/CmmaArtifactLabelObject'

export default class CmmaBoundaryNode {
  constructor(private nodeLabel: string) {}

  public get label() {
    return this.nodeLabel
  }

  public set label(text: string) {
    this.nodeLabel = text
  }
}

export class ArtifactNode {
  constructor(private artifact: CmmaArtifactLabelObject) {}

  public get label() {
    return this.artifact.artifactLabel
  }

  public set label(text: string) {
    this.artifact.artifactLabel = text
  }

  public get artifactGroupLabel() {
    return this.artifact.artifactType
  }
}
