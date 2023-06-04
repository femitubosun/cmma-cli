import CmmaSystem from '../Models/CmmaSystem'
import CmmaModule from '../Models/CmmaModule'
import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaArtifactsGroup from '../Models/CmmaArtifactsGroup'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

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
    artifactDir: CmmaArtifactDirs
    systemMap: CmmaSystem
  }): CmmaArtifactsGroup {
    const { systemMap, artifactDir } = listSystemArtifactsByGroupLabelOptions

    return systemMap.systemArtifacts[artifactDir]
  }

  /**
   * @description Add an Artifact to System Artifact Group
   * @author FATE
   * @param {} addArtifactToArtifactGroupOptions
   */
  public static addArtifactToArtifactGroup(addArtifactToArtifactGroupOptions: {
    artifact: CmmaArtifact
    artifactsDir: CmmaArtifactDirs
    systemMap: CmmaSystem
  }) {
    const { artifact, artifactsDir, systemMap } = addArtifactToArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactsDir,
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
    artifactGroupLabel: CmmaArtifactDirs
    system: CmmaSystem
  }): CmmaArtifact {
    const { artifactLabel, artifactGroupLabel, system } = getArtifactObjectFromArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactGroupLabel,
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
    artifactGroupLabel: CmmaArtifactDirs
    system: CmmaSystem
  }): CmmaArtifact {
    const { artifactIndex, artifactGroupLabel, system } =
      getArtifactObjectFromArtifactGroupByIndexOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactGroupLabel,
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
    artifactDir: CmmaArtifactDirs
    systemMap: CmmaSystem
  }) {
    const { artifactLabel, artifactDir, systemMap } = deleteArtifactObjectFromArtifactGroupOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactDir,
      systemMap: systemMap,
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
    artifactGroupLabel: CmmaArtifactDirs
    system: CmmaSystem
  }) {
    const { artifactIndex, artifactGroupLabel, system } =
      deleteArtifactObjectFromArtifactGroupByIndexOptions

    const artifactGroup = this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactGroupLabel,
      systemMap: system,
    })

    artifactGroup.splice(artifactIndex, 1)
  }

  /**
   * @description Get A Module By Label
   * @author FATE
   * @param {} getModuleByLabelOptions
   */
  public static getModuleMapByLabel(getModuleByLabelOptions: {
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

    return this.getModuleMapByLabel({
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
   * @description Delete Module By Label
   * @author FATE
   * @param {} deleteModuleByLabelOptions
   */
  public static deleteModuleByLabel(deleteModuleByLabelOptions: {
    moduleLabel: string
    systemMap: CmmaSystem
  }) {
    const { moduleLabel, systemMap } = deleteModuleByLabelOptions

    delete systemMap.modules[moduleLabel]
  }

  /**
   * @description Delete System Artifact By Label
   * @author FATE
   * @param {} deleteSystemArtifactByLabelOptions
   */
  public static deleteSystemArtifactByLabel(deleteSystemArtifactByLabelOptions: {
    systemArtifactLabel: CmmaArtifactDirs
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
      systemMap: system,
    })
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
    artifactDir: CmmaArtifactDirs
    systemMap: CmmaSystem
  }) {
    const { systemMap, artifactLabel, artifactDir } = isSystemArtifactInSystemOptions

    return this.listSystemArtifactsByGroupLabel({
      artifactDir: artifactDir,
      systemMap,
    }).includes(artifactLabel)
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
        views: [],
        typechecking: [],
        models: [],
        migrations: [],
        routes: [],
      },
      modules: {},
      systemLabel: '',
    }
  }
}
