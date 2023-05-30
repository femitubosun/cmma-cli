import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaArtifactsGroup from '../Models/CmmaArtifactsGroup'

export default class ArtifactGroupActions {
  /**
   * @description Add an Artifact to ArtifactGroup
   * @author FATE
   * @param {} addArtifactToArtifactsGroupOptions
   */
  public static addArtifactToArtifactsGroup(addArtifactToArtifactsGroupOptions: {
    artifact: CmmaArtifact
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifact, ArtifactsGroup } = addArtifactToArtifactsGroupOptions

    ArtifactsGroup.push(artifact)
  }

  /**
   * @description Get Artifact from ArtifactsGroup by Label
   * @author FATE
   * @param {} getArtifactByLabelOptions
   */
  public static getArtifactByLabel(getArtifactByLabelOptions: {
    artifactLabel: string
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifactLabel, ArtifactsGroup } = getArtifactByLabelOptions

    return ArtifactsGroup.filter((artifacts) => artifacts === artifactLabel)
  }

  /**
   * @description Get Artifact from ArtifactsGroup by Index
   * @author FATE
   * @param {} getArtifactByIndexOptions
   */
  public static getArtifactByIndex(getArtifactByIndexOptions: {
    artifactIndex: string
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifactIndex, ArtifactsGroup } = getArtifactByIndexOptions

    return ArtifactsGroup[artifactIndex]
  }

  /**
   * @description
   * @author FATE
   * @param {} deleteArtifactFromArtifactsGroupByLabelOptions
   */
  public static deleteArtifactFromArtifactsGroupByLabel(deleteArtifactFromArtifactsGroupByLabelOptions: {
    artifactLabel: string
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifactLabel, ArtifactsGroup } = deleteArtifactFromArtifactsGroupByLabelOptions

    const buffer = ArtifactsGroup.filter((artifact) => artifact !== artifactLabel)

    Object.assign(ArtifactsGroup, buffer)
  }

  /**
   * @description
   * @author FATE
   * @param {} deleteArtifactFromArtifactGroupByIndexOptions
   */
  public static deleteArtifactFromArtifactGroupByIndex(deleteArtifactFromArtifactGroupByIndexOptions: {
    artifactIndex: string
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifactIndex, ArtifactsGroup } = deleteArtifactFromArtifactGroupByIndexOptions

    const artifactLabel = ArtifactsGroup[artifactIndex]

    return this.deleteArtifactFromArtifactsGroupByLabel({
      artifactLabel,
      ArtifactsGroup,
    })
  }

  /**
   * @description Check Artifact in Artifacts Group
   * @author FATE
   * @param {} isArtifactInArtifactsGroupOptions
   */
  public static isArtifactInArtifactsGroup(isArtifactInArtifactsGroupOptions: {
    artifactLabel: string
    ArtifactsGroup: CmmaArtifactsGroup
  }) {
    const { artifactLabel, ArtifactsGroup } = isArtifactInArtifactsGroupOptions

    return ArtifactsGroup.includes(artifactLabel)
  }

  /**
   * @description
   * @author FATE
   */
  public static blankArtifactsGroup(): CmmaArtifactsGroup {
    return []
  }

  /**
   * @description What is node path from Project Map
   * @author FATE
   * @param {} whatIsNodeMapFromMeOptions
   */
  public static whatIsNodePathFromMe(whatIsNodeMapFromMeOptions: {
    artifactGroupLabel?: CmmaArtifactGroupLabel
    artifactLabel?: string
  }) {
    const { artifactGroupLabel, artifactLabel } = whatIsNodeMapFromMeOptions

    const nodeMap: Array<string> = []

    if (artifactGroupLabel) {
      nodeMap.push(artifactGroupLabel)
    }

    if (artifactLabel) {
      nodeMap.push(artifactLabel)
    }

    return nodeMap
  }
}
