import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import differenceOfArrays from '../../../cmma/Helpers/Utils/symettericDifferenceOfArrays'
import {
  PRUNING_PROJECT_MAP,
  UPDATING_PROJECT_MAP,
} from '../../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaSystem from '../../../cmma/Models/CmmaSystem'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import {
  ENTITY_ADDED_TO_PROJECT_MAP,
  ENTITY_PRUNED_FROM_PROJECT_MAP,
  FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP,
  FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK,
} from '../../../cmma/Helpers/SystemMessages/SystemMessageFunction'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import CmmaArtifactActions from '../../../cmma/Actions/CmmaArtifactActions'

export default class ConfigUpdate extends BaseCmmaCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:config-update'
  public static description = 'Update CMMA Configuration file with the current Folder Structure'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /*
 |--------------------------------------------------------------------------------
 | CMMA Configuration
 |--------------------------------------------------------------------------------
 |
 */
  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode = 'up'
  protected projectMap
  protected targetEntity: string
  private projectRootPath: string

  /*
  |--------------------------------------------------------------------------------
  | Update Project Contexts
  |--------------------------------------------------------------------------------
  |
  */
  private updateProjectContexts() {
    this.logger.info('Updating Project Contexts')

    const directoryContexts = CmmaFileActions.listSubDirsInDir(this.projectRootPath)
    let projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    const contextsOnDiskButNotOnMap = differenceOfArrays(directoryContexts, projectContexts)

    this.logger.info(
      `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
        entityLabel: 'Context',
        entityCount: contextsOnDiskButNotOnMap.length,
      })}: ${contextsOnDiskButNotOnMap} ${UPDATING_PROJECT_MAP}`
    )

    contextsOnDiskButNotOnMap.forEach((contextLabel) => {
      const defaultContext = CmmaContextActions.blankContext
      defaultContext.contextLabel = contextLabel

      CmmaProjectMapActions.addContextToProject({
        context: defaultContext,
        contextLabel: contextLabel,
        projectMap: this.projectMap,
      })
    })

    this.logger.info(
      `${ENTITY_ADDED_TO_PROJECT_MAP({
        entityCount: contextsOnDiskButNotOnMap.length,
        entityLabel: 'Context',
      })}: ${contextsOnDiskButNotOnMap} `
    )

    // Contexts in Project Map that are not on disk
    projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    const contextsOnMapNotOnDisk = differenceOfArrays(projectContexts, directoryContexts)

    this.logger.info(
      `${FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
        entityLabel: 'Context',
        entityCount: contextsOnMapNotOnDisk.length,
      })}: ${contextsOnDiskButNotOnMap}. ${PRUNING_PROJECT_MAP}`
    )

    contextsOnMapNotOnDisk.forEach((context) => {
      CmmaProjectMapActions.deleteContextByLabel({
        contextLabel: context,
        projectMap: this.projectMap,
      })
    })

    this.logger.info(
      `${ENTITY_PRUNED_FROM_PROJECT_MAP({
        entityLabel: 'Context',
        entityCount: contextsOnMapNotOnDisk.length,
      })}`
    )
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Project Systems
  |--------------------------------------------------------------------------------
  |
  */
  private updateProjectSystems() {
    this.logger.info('Updating Project Systems')

    const contextLabels = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    for (const contextLabel of contextLabels) {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        projectMap: this.projectMap,
        contextLabel,
      })

      const systemsOnMap = CmmaContextActions.listSystemsInContext(contextMap)

      const contextPath = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(contextLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      const systemsOnDisk = CmmaFileActions.listSubDirsInDir(contextPath)

      const systemsOnDiskButNotInProject = differenceOfArrays(systemsOnDisk, systemsOnMap)

      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityCount: systemsOnDiskButNotInProject.length,
          entityLabel: 'System',
        })}: ${systemsOnDiskButNotInProject}. ${UPDATING_PROJECT_MAP}`
      )

      systemsOnDiskButNotInProject.forEach((systemLabel) => {
        const normalizedLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
          identifier: systemLabel,
          configObject: this.PROJECT_CONFIG,
        })

        const defaultSystem = CmmaSystemActions.blankSystemMap
        defaultSystem.systemLabel = normalizedLabel

        CmmaContextActions.addSystemToContext({
          system: defaultSystem,
          systemLabel: normalizedLabel,
          contextMap,
        })
      })

      this.logger.success(
        `${ENTITY_ADDED_TO_PROJECT_MAP({
          entityCount: systemsOnDiskButNotInProject.length,
          entityLabel: 'System',
        })}: ${systemsOnDiskButNotInProject} `
      )

      const updatedSystems = CmmaContextActions.listSystemsInContext(contextMap)

      const systemsInProjectButNotOnDisk = differenceOfArrays(updatedSystems, systemsOnDisk)

      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityCount: systemsInProjectButNotOnDisk.length,
          entityLabel: 'System',
        })}: ${systemsInProjectButNotOnDisk}. ${UPDATING_PROJECT_MAP}`
      )

      systemsInProjectButNotOnDisk.forEach((systemLabel) => {
        CmmaContextActions.deleteContextSystemByLabel({
          systemLabel,
          contextMap,
        })
      })

      this.logger.success(
        `${ENTITY_PRUNED_FROM_PROJECT_MAP({
          entityLabel: 'System',
          entityCount: systemsInProjectButNotOnDisk.length,
        })}`
      )
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Project Modules
  |--------------------------------------------------------------------------------
  |
  */
  private updateProjectModules() {
    const contextLabels = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    for (let contextLabel of contextLabels) {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel,
        projectMap: this.projectMap,
      })

      this.updateContextModules(contextMap)
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Context Modules
  |--------------------------------------------------------------------------------
  |
  */
  private updateContextModules(contextMap: CmmaContext) {
    this.logger.info('Updating Project Modules')
    const contextSystems = CmmaContextActions.listSystemsInContext(contextMap)

    for (let systemLabel of contextSystems) {
      const systemMap = CmmaContextActions.getContextSystemMapByLabel({
        systemLabel,
        contextMap,
      })

      this.updateSystemModules({
        systemMap,
        contextMap,
      })
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Update System Modules
  |--------------------------------------------------------------------------------
  |
  */
  private updateSystemModules(updateSystemModulesOptions: {
    contextMap: CmmaContext
    systemMap: CmmaSystem
  }) {
    const { contextMap, systemMap } = updateSystemModulesOptions

    const moduleDir = CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
      this.PROJECT_CONFIG
    )[0]

    const moduleRootDirPath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(contextMap.contextLabel)
      .toSystem(systemMap.systemLabel)
      .toArtifactsDir(moduleDir)
      .getAbsoluteOsPath(this.application.appRoot)

    const diskModules = CmmaFileActions.listSubDirsInDir(moduleRootDirPath)

    // Add Modules on Disk to Project Map
    if (CmmaFileActions.doesPathExist(moduleRootDirPath)) {
      const mapModules = CmmaSystemActions.listModulesInSystem(systemMap)

      const modulesOnDiskButNotOnMap = differenceOfArrays(diskModules, mapModules)

      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityLabel: 'Module',
          entityCount: modulesOnDiskButNotOnMap.length,
        })}: ${modulesOnDiskButNotOnMap} ${UPDATING_PROJECT_MAP}`
      )

      // Add Modules to System
      modulesOnDiskButNotOnMap.forEach((moduleLabel) => {
        const defaultModule = CmmaModuleActions.blankModuleMap
        defaultModule.moduleLabel = moduleLabel

        CmmaSystemActions.addModuleToSystem({ moduleLabel, systemMap, module: defaultModule })
      })

      //   Add Module Artifacts to modules
      modulesOnDiskButNotOnMap.forEach((moduleLabel) => {
        const moduleMap = CmmaSystemActions.getModuleMapByLabel({
          moduleLabel,
          systemMap,
        })

        const defaultModuleDirs = CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
          this.PROJECT_CONFIG
        )

        for (let moduleRootDir of defaultModuleDirs) {
          const moduleArtifactRoute = new CmmaNodePath(this.PROJECT_CONFIG)
            .buildPath()
            .toContext(contextMap.contextLabel)
            .toSystem(systemMap.systemLabel)
            .toArtifactsDir(moduleRootDir)
            .toModule(moduleMap.moduleLabel)
            .getAbsoluteOsPath(this.application.appRoot)

          const filesInModuleDir = CmmaFileActions.listFilesInDir(moduleArtifactRoute)

          filesInModuleDir.forEach((file) => {
            let artifact = CmmaArtifactActions.blankArtifact

            // get extension
            artifact = file.split('.')[0]

            CmmaModuleActions.addArtifactToModule({
              artifact,
              artifactDirLabel: moduleRootDir,
              moduleMap,
            })
          })
        }
      })

      this.logger.success(
        `${ENTITY_ADDED_TO_PROJECT_MAP({
          entityCount: modulesOnDiskButNotOnMap.length,
          entityLabel: 'Module',
        })}: ${modulesOnDiskButNotOnMap}`
      )
    }

    // Prune Project Map
    const modulesInSystemMap = CmmaSystemActions.listModulesInSystem(systemMap)
    const modulesOnMapButNotOnDisk = differenceOfArrays(modulesInSystemMap, diskModules)

    this.logger.info(
      `${FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
        entityCount: modulesOnMapButNotOnDisk.length,
        entityLabel: 'Module',
      })}: ${modulesOnMapButNotOnDisk} ${PRUNING_PROJECT_MAP}`
    )

    modulesOnMapButNotOnDisk.forEach((moduleLabel) => {
      CmmaSystemActions.deleteModuleByLabel({
        moduleLabel,
        systemMap,
      })
    })

    this.logger.success(
      `${ENTITY_PRUNED_FROM_PROJECT_MAP({
        entityCount: modulesOnMapButNotOnDisk.length,
        entityLabel: 'Module',
      })}`
    )
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Project Artifacts
  |--------------------------------------------------------------------------------
  |
  */

  private updateProjectArtifacts() {
    this.logger.info('Updating Project Artifacts')
    const contextLabels = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    contextLabels.forEach((contextLabel) => {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel,
        projectMap: this.projectMap,
      })

      this.updateContextArtifacts(contextMap)
    })
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Context Artifacts
  |--------------------------------------------------------------------------------
  |
  */
  private updateContextArtifacts(contextMap: CmmaContext) {
    const systemLabels = CmmaContextActions.listSystemsInContext(contextMap)

    systemLabels.forEach((systemLabel) => {
      const systemMap = CmmaContextActions.getContextSystemMapByLabel({
        systemLabel,
        contextMap,
      })

      this.updateSystemArtifacts({
        systemMap,
        contextMap,
      })
    })
  }

  /*
  |--------------------------------------------------------------------------------
  | Update System Artifacts
  |--------------------------------------------------------------------------------
  |
  */
  private updateSystemArtifacts(updateSystemArtifactsOptions: {
    contextMap: CmmaContext
    systemMap: CmmaSystem
  }) {
    const { contextMap, systemMap } = updateSystemArtifactsOptions

    const defaultArtifactsDir = CmmaConfigurationActions.whatIsDefaultSystemArtifactDirs(
      this.PROJECT_CONFIG
    )

    for (let artifactsDir of defaultArtifactsDir) {
      const systemArtifactsDir = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(contextMap.contextLabel)
        .toSystem(systemMap.systemLabel)
        .toArtifactsDir(artifactsDir)
        .getAbsoluteOsPath(this.application.appRoot)

      const artifactsOnDisk = CmmaFileActions.listFilesInDir(systemArtifactsDir)
      const artifactsOnMap = CmmaSystemActions.listSystemArtifactsByGroupLabel({
        systemMap,
        artifactDir: artifactsDir,
      })

      const artifactsOnDiskButNotOnMap = differenceOfArrays(artifactsOnDisk, artifactsOnMap)

      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityLabel: artifactsDir,
          entityCount: artifactsOnDiskButNotOnMap.length,
        })}: ${artifactsOnDiskButNotOnMap} ${UPDATING_PROJECT_MAP}`
      )

      artifactsOnDiskButNotOnMap.forEach((artifactLabel) => {
        let artifact = CmmaArtifactActions.blankArtifact
        artifact = artifactLabel

        CmmaSystemActions.addArtifactToArtifactGroup({
          artifact,
          systemMap,
          artifactsDir: artifactsDir,
        })
      })

      this.logger.success(
        `${ENTITY_ADDED_TO_PROJECT_MAP({
          entityLabel: artifactsDir,
          entityCount: artifactsOnDiskButNotOnMap.length,
        })}`
      )
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | RUN Command
  |--------------------------------------------------------------------------------
  |
  */
  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    this.projectRootPath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .getAbsoluteOsPath(this.application.appRoot)

    this.updateProjectContexts()

    this.updateProjectSystems()

    this.updateProjectModules()

    this.updateProjectArtifacts()

    await this.finishCmmaCommand()
  }
}
