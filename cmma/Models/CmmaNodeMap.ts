import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaArtifactNode from './CmmaArtifactNode'
import CmmaBoundaryNode from './CmmaBoundaryNode'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'
import CmmaArtifactLabelObject from '../TypeChecking/CmmaArtifactLabelObject'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaContext from './CmmaContext'
import CmmaSystemActions from '../Actions/CmmaSystemActions'
import CmmaProjectMapActions from '../Actions/CmmaProjectMapActions'
import CmmaContextActions from '../Actions/CmmaContextActions'
import CmmaProjectNodes from '../TypeChecking/CmmaProjectNodes'

export default class CmmaNodeMap {
  private context: CmmaBoundaryNode
  private system: CmmaBoundaryNode
  private module: CmmaBoundaryNode
  private systemArtifactsDir: CmmaBoundaryNode
  private artifact: CmmaArtifactNode

  private nodes: CmmaProjectNodes

  constructor(private cmmaConfiguration: CmmaConfiguration) {
    this.nodes = {
      context: undefined,
      system: undefined,
      module: undefined,
      systemArtifactsDir: undefined,
      artifact: undefined,
    }
  }

  /**
   * @description Get Relative Path from Node Path
   * @author FATE
   * @param noExt Remove Extension From Artifact
   */
  public getRelativePath(noExt?: boolean) {
    if (noExt) {
      const artifactNode = this.path[this.length - 1]
      const artifactNodeSplit = artifactNode.split('.')

      this.path[this.length - 1] = artifactNodeSplit[0]
    }

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

  public getMigrationTypePath() {
    return (
      './app/' + this.cmmaConfiguration.defaultProjectRootDirInApp + '/' + this.getRelativePath()
    )
  }

  /**
   * @description Draw Path From
   * @author FATE
   */
  public buildPathFromNullNode() {
    return this
  }

  /**
   * @description Add Context Node to Node Path
   * @author FATE
   * @param label
   */
  public toContext(label: string): CmmaNodeMap {
    this.nodes.context = new CmmaBoundaryNode(label)
    this.context = new CmmaBoundaryNode(label)

    return this
  }

  /**
   * @description Add System Node to Node Path
   * @author FATE
   * @param label
   */
  public toSystem(label: string): CmmaNodeMap {
    this.nodes.system = new CmmaBoundaryNode(label)
    this.system = new CmmaBoundaryNode(label)

    return this
  }

  /**
   * @description Add System Artifact Node to Node Path
   * @author FATE
   * @param label
   */
  public toSystemArtifactsDir(label: CmmaArtifactGroupLabel): CmmaNodeMap {
    this.nodes.systemArtifactsDir = new CmmaBoundaryNode(label)
    this.systemArtifactsDir = new CmmaBoundaryNode(label)

    return this
  }

  /**
   * @description Add Module Node to Node Path
   * @author FATE
   * @param label
   */
  public toModule(label: string) {
    this.nodes.module = new CmmaBoundaryNode(label)
    this.module = new CmmaBoundaryNode(label)

    return this
  }

  /**
   * @description Add Artifact Path to Node Path
   * @author FATE
   * @param artifactLabelObject
   */
  public toArtifact(artifactLabelObject: CmmaArtifactLabelObject): CmmaNodeMap {
    this.nodes.artifact = new CmmaArtifactNode(artifactLabelObject)

    const artifactTransformations = CmmaConfigurationActions.getArtifactGroupTransformation({
      artifactGroup: artifactLabelObject.artifactType,
      configObject: this.cmmaConfiguration,
    })

    this.nodes.artifact.ext = artifactTransformations.extname

    this.artifact = new CmmaArtifactNode(artifactLabelObject)

    return this
  }

  /**
   * @description Get Path
   * @author FATE
   * @returns Array<string>
   */
  public get path(): Array<string> {
    const nodeMap: Array<string> = []

    if (this.context) {
      this.context.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.context.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodeMap.push(this.context.label)
    }

    if (this.system) {
      this.system.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.system.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodeMap.push(this.system.label)
    }

    if (this.systemArtifactsDir) {
      this.systemArtifactsDir.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.systemArtifactsDir.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodeMap.push(this.systemArtifactsDir.label)
    }

    if (this.module) {
      this.module.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.module.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodeMap.push(this.module.label)
    }

    if (this.artifact) {
      const transformations = CmmaConfigurationActions.getArtifactGroupTransformation({
        artifactGroup: this.artifact.artifactGroupLabel,
        configObject: this.cmmaConfiguration,
      })

      nodeMap.push(
        CmmaConfigurationActions.transformLabel({
          label: this.artifact.label,
          transformations,
        })
      )
    }

    return nodeMap
  }

  /**
   * @description Get Path of Drawn on Node Map
   * @param noExt: Remove Extension from artifact
   * @author FATE
   */
  public getPath(noExt = false): Array<string> {
    const nodePath: Array<string> = []

    if (this.nodes.context) {
      this.nodes.context.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.context.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodePath.push(this.nodes.context.label)
    }

    if (this.nodes.system) {
      this.nodes.system.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.system.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodePath.push(this.nodes.system.label)
    }

    if (this.nodes.systemArtifactsDir) {
      this.nodes.systemArtifactsDir.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.systemArtifactsDir.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodePath.push(this.nodes.systemArtifactsDir.label)
    }

    if (this.nodes.module) {
      this.nodes.module.label = CmmaConfigurationActions.resolveIdentifier({
        identifier: this.module.label,
        casePattern: this.cmmaConfiguration.defaultCasePattern,
      })

      nodePath.push(this.nodes.module.label)
    }

    if (this.nodes.artifact) {
      const transformations = CmmaConfigurationActions.getArtifactGroupTransformation({
        artifactGroup: this.artifact.artifactGroupLabel,
        configObject: this.cmmaConfiguration,
      })

      nodePath.push(
        CmmaConfigurationActions.transformLabel({
          label: this.nodes.artifact.label,
          transformations,
          noExt,
        })
      )
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
        return this.toSystem(systemLabel)
      }
    }

    return this
  }

  /**
   * @description Find an Artifact in a Project
   * @param artifactObject
   */
  public findArtifactInProject(artifactObject: CmmaArtifactLabelObject): CmmaNodeMap {
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
        this.toContext(contextLabel)

        return this
      }
    }

    return this
  }

  public get systemLabel() {
    return this.nodes.system?.label || undefined
  }

  /**
   * @description Get Length of Path
   * @author FATE
   */
  public get length() {
    return this.getPath().length
  }
}
