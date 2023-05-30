import CmmaContext from '../Models/CmmaContext'
import CmmaProjectMap from '../Models/CmmaProjectMap'
import CmmaArtifact from '../Models/CmmaArtifact'

export default class CmmaProjectMapActions {
  /**
   * @description Add a Context to Project
   * @author FATE
   * @param addContextToProjectOptions
   */
  public static addContextToProject(addContextToProjectOptions: {
    contextLabel: string
    context: CmmaContext
    projectMap: CmmaProjectMap
  }) {
    const { contextLabel, context, projectMap } = addContextToProjectOptions

    Object.assign(projectMap.Contexts, {
      [contextLabel]: context,
    })
  }

  /**
   * @description Get Context By Index
   * @param getContextObjectByIndexOptions
   * @author Fate
   */
  public static getContextByIndex(getContextObjectByIndexOptions: {
    contextIndex: number
    projectMap: CmmaProjectMap
  }): CmmaContext {
    const { contextIndex, projectMap } = getContextObjectByIndexOptions
    const contextLabels = Object.keys(projectMap.Contexts)

    return projectMap.Contexts[contextLabels[contextIndex]]
  }

  /**
   * @description Get a context by Label
   * @author FATE
   * @param getContextFromProjectMapOptions
   */
  public static getContextObjectByLabel(getContextFromProjectMapOptions: {
    projectMap: CmmaProjectMap
    contextLabel: string
  }) {
    const { projectMap, contextLabel } = getContextFromProjectMapOptions

    return projectMap.Contexts[contextLabel]
  }

  /**
   * @description List Contexts In Project
   * @author FATE
   * @param {CmmaProjectMap} projectMap
   */
  public static listContextsInProject(projectMap: CmmaProjectMap) {
    return Object.keys(projectMap.Contexts)
  }

  /**
   * @description Delete Context By Index
   * @author FATE
   * @param {} deleteContextByIndexOptions
   */
  public static deleteContextByIndex(deleteContextByIndexOptions: {
    contextIndex: number
    projectMap: CmmaProjectMap
  }) {
    const { contextIndex, projectMap } = deleteContextByIndexOptions
    const contextLabels = Object.keys(projectMap.Contexts)

    const contextLabel = contextLabels[contextIndex]

    delete projectMap.Contexts[contextLabel]
  }

  /**
   * @description Delete Context By Label
   * @author FATE
   * @param {} deleteContextByLabelOptions
   */
  public static deleteContextByLabel(deleteContextByLabelOptions: {
    contextLabel: string
    projectMap: CmmaProjectMap
  }) {
    const { projectMap, contextLabel } = deleteContextByLabelOptions

    delete projectMap.Contexts[contextLabel]
  }

  /**
   * @description Check if Context is in Project
   * @author FATE
   * @param {} isContextInProjectOptions
   */
  public static isContextInProject(isContextInProjectOptions: {
    contextLabel: string
    projectMap: CmmaProjectMap
  }) {
    const { contextLabel, projectMap } = isContextInProjectOptions

    return this.listContextsInProject(projectMap).includes(contextLabel)
  }

  public static addArtifactToProject(addArtifactToProjectOptions: {
    artifact: CmmaArtifact
    projectMap: CmmaProjectMap
  }) {
    const { artifact, projectMap } = addArtifactToProjectOptions

    projectMap.Artifacts.push(artifact)
  }

  /**
   * @description Get Blank Project Map
   * @author FATE
   */
  public static get blankProjectMap(): CmmaProjectMap {
    return {
      Contexts: {},
      Artifacts: [],
    }
  }
}
