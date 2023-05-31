import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaNode from './CmmaNode'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaArtifactLabelObject from '../TypeChecking/CmmaArtifactLabelObject'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaContext from './CmmaContext'
import CmmaSystemActions from '../Actions/CmmaSystemActions'
import CmmaProjectMapActions from '../Actions/CmmaProjectMapActions'
import CmmaContextActions from '../Actions/CmmaContextActions'
import CmmaProjectMapNodes from '../TypeChecking/CmmaProjectMapNodes'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'

export default class CmmaNodePath {
  private nodes: CmmaProjectMapNodes

  constructor(private cmmaConfiguration: CmmaConfiguration) {
    this.nodes = {
      context: undefined,
      system: undefined,
      module: undefined,
      systemArtifactsDir: undefined,
      modelDir: undefined,
      artifact: undefined,
    }
  }

  /**
   * @description Get Relative Path from Node Path
   * @author FATE
   */
  public getRelativePath() {
    return this.path.join('/')
  }

  /**
   * @description Get Absolute OS Path
   * @author FATE
   * @param appRoot
   */
  public getAbsoluteOsPath(appRoot: string) {
    return CmmaFileActions.joinPath([
      appRoot,
      'app',
      this.cmmaConfiguration.defaultProjectRootDirInApp,
      ...this.path,
    ])
  }

  /**
   * @description Get Migrations Folder Imports Style Path
   * @author FATE
   */
  public getMigrationTypePath() {
    return (
      './app/' + this.cmmaConfiguration.defaultProjectRootDirInApp + '/' + this.getRelativePath()
    )
  }

  /**
   * @description Get import used in Artifacts
   * @author FATE
   */
  public getArtifactImportTypePath() {
    return 'App/' + this.cmmaConfiguration.defaultProjectRootDirInApp + '/' + this.getRelativePath()
  }

  /**
   * @description Draw Path From
   * @author FATE
   */
  public drawPath() {
    return this
  }

  /**
   * @description Add Context Node to Node Path
   * @author FATE
   * @param label
   */
  public toContext(label: string): CmmaNodePath {
    const nodeLabel = CmmaConfigurationActions.resolveIdentifierToCasePattern({
      identifier: label,
      casePattern: this.cmmaConfiguration.defaultCasePattern,
    })

    this.nodes.context = new CmmaNode(nodeLabel)
    return this
  }

  /**
   * @description Add System Node to Node Path
   * @author FATE
   * @param label
   */
  public toSystem(label: string): CmmaNodePath {
    const nodeLabel = CmmaConfigurationActions.resolveIdentifierToCasePattern({
      identifier: label,
      casePattern: this.cmmaConfiguration.defaultCasePattern,
    })

    this.nodes.system = new CmmaNode(nodeLabel)
    return this
  }

  /**
   * @description Add System Artifact Node to Node Path
   * @author FATE
   * @param label
   */
  public toSystemArtifactsDir(label: CmmaArtifactGroupLabel): CmmaNodePath {
    const nodeLabel = CmmaConfigurationActions.resolveIdentifierToCasePattern({
      identifier: label,
      casePattern: this.cmmaConfiguration.defaultCasePattern,
    })

    this.nodes.systemArtifactsDir = new CmmaNode(nodeLabel)
    return this
  }

  /**
   * @description Add model Directory Node to Node Path for generating Paths for Typechecking Directory
   * @author FATE
   * @param label
   */
  public toModelDir(label: string) {
    const nodeLabel = CmmaConfigurationActions.resolveIdentifierToCasePattern({
      identifier: label,
      casePattern: this.cmmaConfiguration.defaultCasePattern,
    })

    this.nodes.modelDir = new CmmaNode(nodeLabel)

    return this
  }

  /**
   * @description Add Module Node to Node Path
   * @author FATE
   * @param label
   */
  public toModule(label: string) {
    const nodeLabel = CmmaConfigurationActions.resolveIdentifierToCasePattern({
      identifier: label,
      casePattern: this.cmmaConfiguration.defaultCasePattern,
    })

    this.nodes.module = new CmmaNode(nodeLabel)
    return this
  }

  /**
   * @description Add Artifact Path to Node Path
   * @author FATE
   * @param toArtifactOptions
   */
  public toArtifact(toArtifactOptions: {
    artifactLabel: string
    artifactType: CmmaArtifactType
    noExt?: boolean
  }): CmmaNodePath {
    const { artifactLabel, artifactType, noExt } = toArtifactOptions

    const normalizedArtifactLabel = CmmaConfigurationActions.normalizeArtifactLabel({
      artifactLabel,
      artifactType,
      configObject: this.cmmaConfiguration,
      noExt,
    })

    this.nodes.artifact = new CmmaNode(normalizedArtifactLabel)

    return this
  }

  /**
   * @description Get Path of Drawn on Node Map
   * @author FATE
   */
  public get path(): Array<string> {
    const nodePath: Array<string> = []

    if (this.nodes.context) {
      nodePath.push(this.nodes.context.label)
    }

    if (this.nodes.system) {
      nodePath.push(this.nodes.system.label)
    }

    if (this.nodes.systemArtifactsDir) {
      nodePath.push(this.nodes.systemArtifactsDir.label)
    }

    if (this.nodes.module) {
      nodePath.push(this.nodes.module.label)
    }

    if (this.nodes.modelDir) {
      nodePath.push(this.nodes.modelDir.label)
    }

    if (this.nodes.artifact) {
      nodePath.push(this.nodes.artifact.label)
    }

    return nodePath
  }

  /**
   * @description Find An Artifact in a context
   * @param findArtifactInContextOptions
   */
  public findArtifactInContext(findArtifactInContextOptions: {
    contextMap: CmmaContext
    artifactObject: CmmaArtifactLabelObject
  }) {
    const { contextMap, artifactObject } = findArtifactInContextOptions

    const systemLabels = CmmaContextActions.listSystemsInContext(contextMap)

    for (let systemLabel of systemLabels) {
      const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
        systemLabel,
        contextMap,
      })

      if (
        CmmaSystemActions.isArtifactInSystemArtifactGroup({
          systemMap,
          artifactLabel: artifactObject.artifactLabel,
          artifactGroupLabel: artifactObject.artifactType,
        })
      ) {
        this.toSystem(systemLabel)
        return this.toContext(contextMap.contextLabel)
      }
    }

    return this
  }

  /**
   * @description Find an Artifact in a Project
   * @param artifactObject
   */
  public findArtifactInProject(artifactObject: CmmaArtifactLabelObject): CmmaNodePath {
    const projectMap = this.cmmaConfiguration.projectMap

    const contextLabels = CmmaProjectMapActions.listContextsInProject(projectMap)

    for (let contextLabel of contextLabels) {
      const contextMap = CmmaProjectMapActions.getContextObjectByLabel({
        contextLabel,
        projectMap,
      })

      this.findArtifactInContext({
        contextMap,
        artifactObject,
      })

      if (this.length > 0) {
        return this
      }
    }

    return this
  }

  public get systemLabel() {
    return this.nodes.system?.label || undefined
  }

  public get artifactLabel() {
    return this.nodes.artifact?.label || undefined
  }

  public get contextLabel() {
    return this.nodes.context?.label || undefined
  }

  public get artifactDirLabel() {
    return this.nodes.systemArtifactsDir?.label || undefined
  }

  /**
   * @description Get Length of Path
   * @author FATE
   */
  public get length() {
    return this.path.length
  }
}
