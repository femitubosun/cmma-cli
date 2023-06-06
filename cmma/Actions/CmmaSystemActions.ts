import CmmaSystem from '../Models/CmmaSystem'
import CmmaModule from '../Models/CmmaModule'
import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaArtifactsGroup from '../Models/CmmaArtifactsGroup'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'
import CmmaAbstractArtifactEnum from '../TypeChecking/AbstractArtifact/CmmaAbstractArtifactEnum'

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
   * @description Get a Module's index by Label
   * @author FATE
   * @param {} getModuleIndexByLabelOptions
   */
  public static getModuleIndexByLabel(getModuleIndexByLabelOptions: {
    systemMap: CmmaSystem
    moduleLabel: string
  }) {
    const { systemMap, moduleLabel } = getModuleIndexByLabelOptions

    return this.listModulesInSystem(systemMap).indexOf(moduleLabel)
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
   * @description List Systemm Abstract Artifacts Label
   * @author FATE
   * @param {} system
   */
  public static listSystemAbstractArtifactGroups(system: CmmaSystem) {
    return Object.keys(system.abstractArtifacts)
  }

  /**
   * @description E.g List Models, List Controllers
   * @author FATE
   * @param {} listSystemArtifactsByGroupLabelOptions
   */
  public static listSystemArtifactsByGroupLabel(listSystemArtifactsByGroupLabelOptions: {
    artifactsDir: CmmaArtifactDirs
    systemMap: CmmaSystem
  }): CmmaArtifactsGroup {
    const { systemMap, artifactsDir } = listSystemArtifactsByGroupLabelOptions

    return systemMap.systemArtifacts[artifactsDir]
  }

  /**
   * @description
   * @author FATE
   * @param {} listSystemAbstractArtifactsByGroupLabelOptions
   */
  public static listSystemAbstractArtifactsByGroupLabel(listSystemAbstractArtifactsByGroupLabelOptions: {
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { systemMap, abstractArtifactGroupLabel } = listSystemAbstractArtifactsByGroupLabelOptions

    return systemMap.abstractArtifacts[abstractArtifactGroupLabel]
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
      artifactsDir,
      systemMap,
    })

    artifactGroup.push(artifact)
  }

  /**
   * @description Add an abstract artifact to Project
   * @author FATE
   * @param {} addAbstractArtifactToAbstractArtifactGroupOptions
   */
  public static addAbstractArtifactToAbstractArtifactGroup(addAbstractArtifactToAbstractArtifactGroupOptions: {
    abstractArtifact: string
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifact, abstractArtifactGroupLabel, systemMap } =
      addAbstractArtifactToAbstractArtifactGroupOptions

    const abstractArtifactGroup = this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    })

    abstractArtifactGroup.push(abstractArtifact)
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
      artifactsDir: artifactGroupLabel,
      systemMap: system,
    })

    const buffer = artifactGroup.filter((artifact) => artifact === artifactLabel)

    return buffer[0]
  }

  /**
   * @description Get abstract Artifact from Abstract Artifact Group By Label
   * @author FATE
   * @param {} getAbstractArtifactFromAbstractArtifactGroupByLabelOptions
   */
  public static getAbstractArtifactFromAbstractArtifactGroupByLabel(getAbstractArtifactFromAbstractArtifactGroupByLabelOptions: {
    abstractArtifact: string
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifact, abstractArtifactGroupLabel, systemMap } =
      getAbstractArtifactFromAbstractArtifactGroupByLabelOptions

    const abstractArtifactsGroup = this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    })

    return abstractArtifactsGroup[abstractArtifactsGroup.indexOf(abstractArtifact)]
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
      artifactsDir: artifactGroupLabel,
      systemMap: system,
    })

    return artifactGroup[artifactIndex]
  }

  /**
   * @description Get abstract Artifact from Abstract Artifact Group By Index
   * @author FATE
   * @param {} getAbstractArtifactFromAbstractArtifactGroupByLabelOptions
   */
  public static getAbstractArtifactFromAbstractArtifactGroupByIndex(getAbstractArtifactFromAbstractArtifactGroupByLabelOptions: {
    abstractArtifactIndex: number
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifactIndex, abstractArtifactGroupLabel, systemMap } =
      getAbstractArtifactFromAbstractArtifactGroupByLabelOptions

    const abstractArtifactsGroup = this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    })

    return abstractArtifactsGroup[abstractArtifactIndex]
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
      artifactsDir: artifactDir,
      systemMap: systemMap,
    })

    const artifactIndex = artifactGroup.indexOf(artifactLabel)

    artifactGroup.splice(artifactIndex, 1)
  }

  /**
   * @description Delete an Abstract Artifact from System Abstract Artifact Group By Label
   * @author FATE
   * @param {} deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions
   */
  public static deleteAbstractArtifactFromAbstractArtifactGroupByLabel(deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions: {
    abstractArtifactLabel: string
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifactLabel, abstractArtifactGroupLabel, systemMap } =
      deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions

    const abstractArtifactGroup = this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    })

    const artifactIndex = abstractArtifactGroup.indexOf(abstractArtifactLabel)

    abstractArtifactGroup.splice(artifactIndex, 1)
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
      artifactsDir: artifactGroupLabel,
      systemMap: system,
    })

    artifactGroup.splice(artifactIndex, 1)
  }

  /**
   * @description Delete an Abstract Artifact from System Abstract Artifact Group By Index
   * @author FATE
   * @param {} deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions
   */
  public static deleteAbstractArtifactFromAbstractArtifactGroupByIndex(deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions: {
    abstractArtifactIndex: number
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifactIndex, abstractArtifactGroupLabel, systemMap } =
      deleteAbstractArtifactFromAbstractArtifactGroupByLabelOptions

    const abstractArtifactGroup = this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    })

    abstractArtifactGroup.splice(abstractArtifactIndex, 1)
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
      artifactsDir: artifactDir,
      systemMap,
    }).includes(artifactLabel)
  }

  public static isAbstractArtifactInArtifactGroup(isAbstractArtifactInArtifactGroupOptions: {
    abstractArtifactLabel: string
    abstractArtifactGroupLabel: CmmaAbstractArtifactEnum
    systemMap: CmmaSystem
  }) {
    const { abstractArtifactLabel, abstractArtifactGroupLabel, systemMap } =
      isAbstractArtifactInArtifactGroupOptions

    return this.listSystemAbstractArtifactsByGroupLabel({
      abstractArtifactGroupLabel,
      systemMap,
    }).includes(abstractArtifactLabel)
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
        typeChecking: [],
        models: [],
        migrations: [],
        routes: [],
      },
      abstractArtifacts: {},
      modules: {},
      systemLabel: '',
    }
  }
}
