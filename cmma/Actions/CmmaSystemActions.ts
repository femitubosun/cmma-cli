import CmmaSystem from '../Models/CmmaSystem'
import CmmaModule from '../Models/CmmaModule'
import CmmaSystemResource from '../Models/CmmaSystemResource'
import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaDefaultSystemArtifactDirLabel from '../TypeChecking/CmmaDefaultSystemArtifactDirLabel'
import CmmaArtifactsGroup from '../Models/CmmaArtifactsGroup'

export default class CmmaSystemActions {
  /**
   * @description Add a CmmaModule To a System
   * @author FATE
   * @param {} addModuleToSystemOptions
   */
  public static addModuleToSystem(addModuleToSystemOptions: {
    moduleLabel: string
    module: CmmaModule
    systemMap: CmmaSystem
  }) {
    const { moduleLabel, module, systemMap } = addModuleToSystemOptions

    Object.assign(systemMap.modules, {
      [moduleLabel]: module,
    })
  }

  /**
   * @description Add a System CmmaResource to a System
   * @author FATE
   * @param {} addSystemResourceToSystemOptions
   */
  public static addSystemResourceToSystem(addSystemResourceToSystemOptions: {
    resourceLabel: string
    systemResource: CmmaSystemResource
    system: CmmaSystem
  }) {
    const { resourceLabel, systemResource, system } = addSystemResourceToSystemOptions

    Object.assign(system.SystemResources, {
      [resourceLabel]: systemResource,
    })
  }

  /**
   * @description List Modules in a System
   * @author FATE
   * @param {CmmaSystem} system
   */
  public static listModulesInSystem(system: CmmaSystem) {
    return Object.keys(system.modules)
  }

  /**
   * @description List System Artifacts Label
   * @author FATE
   * @param {} system
   */
  public static listSystemArtifactGroups(system: CmmaSystem) {
    return Object.keys(system.systemArtifacts)
  }

  /**
   * @description E.g List Models, List Controllers
   * @author FATE
   * @param {} listSystemArtifactsByGroupLabelOptions
   */
  public static listSystemArtifactsByGroupLabel(listSystemArtifactsByGroupLabelOptions: {
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    systemMap: CmmaSystem
  }): CmmaArtifactsGroup {
    const { systemMap, artifactGroupLabel } = listSystemArtifactsByGroupLabelOptions

    return systemMap.systemArtifacts[artifactGroupLabel]
  }

  /**
   * @description Add an Artifact to System Artifact Group
   * @author FATE
   * @param {} addArtifactToArtifactGroupOptions
   */
  public static addArtifactToArtifactGroup(addArtifactToArtifactGroupOptions: {
    artifact: CmmaArtifact
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    systemMap: CmmaSystem
  }) {
    const { artifact, artifactGroupLabel, systemMap } = addArtifactToArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap,
    })

    artifactGroup.push(artifact)
  }

  /**
   * @description Get an Artifact Object from System Artifact Group
   * @author FATE
   * @param {} getArtifactObjectFromArtifactGroupOptions
   */
  public static getArtifactObjectFromArtifactGroupByLabel(getArtifactObjectFromArtifactGroupOptions: {
    artifactLabel: string
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    system: CmmaSystem
  }): CmmaArtifact {
    const { artifactLabel, artifactGroupLabel, system } = getArtifactObjectFromArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap: system,
    })

    const buffer = artifactGroup.filter((artifact) => artifact === artifactLabel)

    return buffer[0]
  }

  /**
   * @description Get an Artifact Object from Artifact Group by Index
   * @author FATE
   * @param {} getArtifactObjectFromArtifactGroupByIndexOptions
   */
  public static getArtifactObjectFromArtifactGroupByIndex(getArtifactObjectFromArtifactGroupByIndexOptions: {
    artifactIndex: number
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    system: CmmaSystem
  }): CmmaArtifact {
    const { artifactIndex, artifactGroupLabel, system } =
      getArtifactObjectFromArtifactGroupByIndexOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap: system,
    })

    return artifactGroup[artifactIndex]
  }

  /**
   * @description Delete an Artifact Object from System Artifact Group
   * @author FATE
   * @param {} deleteArtifactObjectFromArtifactGroupOptions
   */
  public static deleteArtifactObjectFromArtifactGroupByLabel(deleteArtifactObjectFromArtifactGroupOptions: {
    artifactLabel: string
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    system: CmmaSystem
  }) {
    const { artifactLabel, artifactGroupLabel, system } =
      deleteArtifactObjectFromArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap: system,
    })

    const buffer = artifactGroup.filter((artifact) => artifact !== artifactLabel)

    Object.assign(artifactGroup, buffer)
  }

  /**
   * @description Delete an Artifact Object from Artifact Group by Index
   * @author FATE
   * @param {} deleteArtifactObjectFromArtifactGroupByIndexOptions
   */
  public static deleteArtifactObjectFromArtifactGroupByIndex(deleteArtifactObjectFromArtifactGroupByIndexOptions: {
    artifactIndex: number
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    system: CmmaSystem
  }) {
    const { artifactIndex, artifactGroupLabel, system } =
      deleteArtifactObjectFromArtifactGroupByIndexOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap: system,
    })

    artifactGroup.splice(artifactIndex, 1)
  }

  /**
   * @description Get A Module By Label
   * @author FATE
   * @param {} getModuleByLabelOptions
   */
  public static getModuleByLabel(getModuleByLabelOptions: {
    moduleLabel: string
    systemMap: CmmaSystem
  }) {
    const { moduleLabel, systemMap } = getModuleByLabelOptions

    return systemMap.modules[moduleLabel]
  }

  /**
   * @description Get A System Artifact By Label
   * @author FATE
   * @param {} getSystemArtifactByLabelOptions
   */
  public static getSystemArtifactByLabel(getSystemArtifactByLabelOptions: {
    systemArtifactLabel: string
    system: CmmaSystem
  }) {
    const { system, systemArtifactLabel } = getSystemArtifactByLabelOptions

    return system.systemArtifacts[systemArtifactLabel]
  }

  /**
   * @description Get a System Resource By Label
   * @author FATE
   * @param {} getSystemResourceByLabelOptions
   */
  public static getSystemResourceByLabel(getSystemResourceByLabelOptions: {
    systemResourceLabel: string
    system: CmmaSystem
  }) {
    const { system, systemResourceLabel } = getSystemResourceByLabelOptions

    return system.SystemResources[systemResourceLabel]
  }

  /**
   * @description Get a Module By Index
   * @author FATE
   * @param {} getModuleByIndexOptions
   */
  public static getModuleByIndex(getModuleByIndexOptions: {
    moduleIndex: number
    system: CmmaSystem
  }) {
    const { moduleIndex, system } = getModuleByIndexOptions

    const moduleLabels = this.listModulesInSystem(system)

    return this.getModuleByLabel({
      moduleLabel: moduleLabels[moduleIndex],
      systemMap: system,
    })
  }

  /**
   * @description Get System Artifact By Index
   * @author FATE
   * @param {} getSystemArtifactByIndexOptions
   */
  public static getSystemArtifactByIndex(getSystemArtifactByIndexOptions: {
    systemArtifactIndex: number
    systemArtifactLabel: string
    system: CmmaSystem
  }) {
    const { system, systemArtifactIndex, systemArtifactLabel } = getSystemArtifactByIndexOptions

    const systemArtifactLabels = this.getSystemArtifactByLabel({
      systemArtifactLabel,
      system,
    })

    return this.getSystemArtifactByLabel({
      systemArtifactLabel: systemArtifactLabels[systemArtifactIndex],
      system,
    })
  }

  /**
   * @description Get System Resource By Index
   * @author FATE
   * @param {} getSystemResourceByIndexOptions
   */
  public static getSystemResourceByIndex(getSystemResourceByIndexOptions: {
    systemResourceIndex: number
    system: CmmaSystem
  }) {
    const { system, systemResourceIndex } = getSystemResourceByIndexOptions

    const systemResourceLabels = Object.keys(system.SystemResources)

    return this.getSystemResourceByLabel({
      systemResourceLabel: systemResourceLabels[systemResourceIndex],
      system,
    })
  }

  /**
   * @description Delete Module By Label
   * @author FATE
   * @param {} deleteModuleByLabelOptions
   */
  public static deleteModuleByLabel(deleteModuleByLabelOptions: {
    moduleLabel: string
    system: CmmaSystem
  }) {
    const { moduleLabel, system } = deleteModuleByLabelOptions

    delete system.modules[moduleLabel]
  }

  /**
   * @description Delete System Artifact By Label
   * @author FATE
   * @param {} deleteSystemArtifactByLabelOptions
   */
  public static deleteSystemArtifactByLabel(deleteSystemArtifactByLabelOptions: {
    systemArtifactLabel: CmmaDefaultSystemArtifactDirLabel
    system: CmmaSystem
  }) {
    const { systemArtifactLabel, system } = deleteSystemArtifactByLabelOptions

    delete system.systemArtifacts[systemArtifactLabel]
  }

  /**
   * @description Delete Module By Index
   * @author FATE
   * @param {} deleteModuleByIndexOptions
   */
  public static deleteModuleByIndex(deleteModuleByIndexOptions: {
    moduleIndex: number
    system: CmmaSystem
  }) {
    const { moduleIndex, system } = deleteModuleByIndexOptions

    const moduleLabels = Object.keys(system.modules)

    return this.deleteModuleByLabel({
      moduleLabel: moduleLabels[moduleIndex],
      system,
    })
  }

  // TODO fix System Resources
  /**
   * @description Delete System Resource By Index
   * @author FATE
   * @param {} deleteSystemResourceByIndexOptions
   */
  public static deleteSystemResourceByIndex(deleteSystemResourceByIndexOptions: {
    systemResourceIndex: number
    system: CmmaSystem
  }) {
    const { system } = deleteSystemResourceByIndexOptions

    const systemResourceLabels = Object.keys(system.SystemResources)

    return systemResourceLabels

    // return this.deleteSystemArtifactByLabel({
    //   systemArtifactLabel: systemResourceLabels[systemResourceIndex],
    //   system,
    // })
  }

  /**
   * @description Check if Module Is In System
   * @author FATE
   * @param {} isModuleInSystemOptions
   */
  public static isModuleInSystem(isModuleInSystemOptions: {
    moduleLabel: string
    systemMap: CmmaSystem
  }) {
    const { moduleLabel, systemMap } = isModuleInSystemOptions

    return this.listModulesInSystem(systemMap).includes(moduleLabel)
  }

  /**
   * @description Check if System Artifact is in System
   * @author FATE
   * @param isSystemArtifactInSystemOptions
   */
  public static isArtifactInSystemArtifactGroup(isSystemArtifactInSystemOptions: {
    artifactLabel: string
    artifactGroupLabel: CmmaDefaultSystemArtifactDirLabel
    systemMap: CmmaSystem
  }) {
    const { systemMap, artifactLabel, artifactGroupLabel } = isSystemArtifactInSystemOptions

    return this.listSystemArtifactsByGroupLabel({
      artifactGroupLabel,
      systemMap,
    }).includes(artifactLabel)
  }

  /**
   * @description Get a System's Routes file name
   * @author FATE
   * @param {CmmaSystem} system
   * @returns string
   */
  public static whatIsSystemRoutesFileName(system: CmmaSystem) {
    return system.SystemRoutesFilename
  }

  /**
   * @description Get a System's Views file name
   * @author FATE
   * @param system
   */
  public static whatIsSystemViewsFileName(system: CmmaSystem) {
    return system.SystemViewsFileName
  }

  /**
   * @description What is node path from Project Map
   * @author FATE
   * @param {} whatIsNodeMapFromMeOptions
   */
  public static whatIsNodePathFromMe(whatIsNodeMapFromMeOptions: {
    systemLabel?: string
    moduleLabel?: string
    artifactGroupLabel?: CmmaDefaultSystemArtifactDirLabel
    artifactLabel?: string
  }) {
    const { systemLabel, moduleLabel, artifactGroupLabel, artifactLabel } =
      whatIsNodeMapFromMeOptions

    const nodeMap: Array<string> = []

    if (systemLabel) {
      nodeMap.push(systemLabel)
    }

    if (moduleLabel) {
      nodeMap.push(moduleLabel)
    }

    if (artifactGroupLabel) {
      nodeMap.push(artifactGroupLabel)
    }

    if (artifactLabel) {
      nodeMap.push(artifactLabel)
    }

    return nodeMap
  }

  /**
   * @description Method to get a blank System Map
   * @author FATE
   * @returns {CmmaSystem}
   */
  public static get blankSystemMap(): CmmaSystem {
    return {
      systemArtifacts: {
        actions: [],
        controllers: [],
        validators: [],
        views: [],
        typechecking: [],
        models: [],
        migrations: [],
        routes: [],
      },
      modules: {},
      SystemResources: {},
      SystemRoutesFilename: '',
      SystemViewsFileName: '',
    }
  }
}
