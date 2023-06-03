import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import differenceOfArrays from '../../../cmma/Helpers/Utils/symettericDifferenceOfArrays'
import {
  CONTEXT,
  MODULE,
  PRUNING_PROJECT_MAP,
  SYSTEM,
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
import CmmaArtifactActions from '../../../cmma/Actions/CmmaArtifactActions'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'

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
    this.addProjectContextsOnDiskToProjectMap()
    this.pruneLooseProjectContextsFromProjectMap()
  }

  private addProjectContextsOnDiskToProjectMap() {
    if (!CmmaFileActions.doesPathExist(this.projectRootPath)) {
      return
    }

    const contextsOnDisk = CmmaFileActions.listContextsOnDisk(this.projectRootPath)
    let contextsOnProjectMap = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    const contextsOnDiskButNotOnMap = differenceOfArrays(contextsOnDisk, contextsOnProjectMap)

    if (contextsOnDiskButNotOnMap.length) {
      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityLabel: CONTEXT,
          entityCount: contextsOnDiskButNotOnMap.length,
        })}| ${contextsOnDiskButNotOnMap} ${UPDATING_PROJECT_MAP}`
      )
    }

    contextsOnDiskButNotOnMap.forEach((contextLabel) => {
      const defaultContext = CmmaContextActions.blankContext
      defaultContext.contextLabel = contextLabel

      CmmaProjectMapActions.addContextToProject({
        context: defaultContext,
        contextLabel: contextLabel,
        projectMap: this.projectMap,
      })
    })

    if (contextsOnDiskButNotOnMap.length) {
      this.logger.info(
        this.colors.cyan(
          `${ENTITY_ADDED_TO_PROJECT_MAP({
            entityCount: contextsOnDiskButNotOnMap.length,
            entityLabel: CONTEXT,
          })}| ${contextsOnDiskButNotOnMap}`
        )
      )
    }
  }

  private pruneLooseProjectContextsFromProjectMap() {
    if (!CmmaFileActions.doesPathExist(this.projectRootPath)) {
      return
    }

    const contextsOnProjectMap = CmmaProjectMapActions.listContextsInProject(this.projectMap)
    const contextsOnDisk = CmmaFileActions.listContextsOnDisk(this.projectRootPath)

    const contextsOnMapNotOnDisk = differenceOfArrays(contextsOnProjectMap, contextsOnDisk)

    if (contextsOnMapNotOnDisk.length) {
      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
          entityLabel: CONTEXT,
          entityCount: contextsOnMapNotOnDisk.length,
        })}: ${contextsOnMapNotOnDisk}. ${PRUNING_PROJECT_MAP}`
      )
    }

    contextsOnMapNotOnDisk.forEach((contextLabel) => {
      CmmaProjectMapActions.deleteContextByLabel({
        contextLabel,
        projectMap: this.projectMap,
      })
    })

    if (contextsOnMapNotOnDisk.length) {
      this.logger.info(
        this.colors.cyan(
          `${ENTITY_PRUNED_FROM_PROJECT_MAP({
            entityLabel: CONTEXT,
            entityCount: contextsOnMapNotOnDisk.length,
          })}`
        )
      )
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Project Systems
  |--------------------------------------------------------------------------------
  |
  */
  private updateProjectSystems() {
    const contextLabelsOnDisk = CmmaFileActions.listContextsOnDisk(this.projectRootPath)

    contextLabelsOnDisk.forEach((contextLabel) => {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel,
        projectMap: this.projectMap,
      })

      this.addContextSystemsOnDiskToProjectMap({
        contextMap,
        diskContextDirLabel: contextLabel,
      })

      this.pruneLooseContextSystemsFromProjectMap({
        diskContextDirLabel: contextLabel,
        contextMap,
      })
    })
  }

  private addContextSystemsOnDiskToProjectMap(addContextSystemsOnDiskToProjectMapOptions: {
    diskContextDirLabel: string
    contextMap: CmmaContext
  }) {
    const { diskContextDirLabel, contextMap } = addContextSystemsOnDiskToProjectMapOptions

    const diskContextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextDirLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(diskContextDir)) {
      this.logger.error('Context Dir Does not exist')

      return
    }

    const systemsOnDisk = CmmaFileActions.listSubDirsInDir(diskContextDir)
    const systemsOnProjectMap = CmmaContextActions.listSystemsInContext(contextMap)

    const systemsOnDiskButNotOnProjectMap = differenceOfArrays(systemsOnDisk, systemsOnProjectMap)

    if (systemsOnDiskButNotOnProjectMap.length) {
      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityLabel: SYSTEM,
          entityCount: systemsOnDiskButNotOnProjectMap.length,
        })}. ${UPDATING_PROJECT_MAP}`
      )
    }

    systemsOnDiskButNotOnProjectMap.forEach((systemLabel) => {
      const system = CmmaSystemActions.blankSystemMap
      system.systemLabel = systemLabel

      CmmaContextActions.addSystemToContext({
        system,
        systemLabel,
        contextMap,
      })
    })

    if (systemsOnDiskButNotOnProjectMap.length) {
      this.logger.info(
        `${this.colors.cyan(
          ENTITY_ADDED_TO_PROJECT_MAP({
            entityLabel: SYSTEM,
            entityCount: systemsOnDiskButNotOnProjectMap.length,
          })
        )}`
      )
    }
  }

  private pruneLooseContextSystemsFromProjectMap(pruneLooseContextSystemsFromProjectMapOptions: {
    diskContextDirLabel: string
    contextMap: CmmaContext
  }) {
    const { diskContextDirLabel, contextMap } = pruneLooseContextSystemsFromProjectMapOptions

    const diskContextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextDirLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(diskContextDir)) {
      return
    }

    const systemsOnProjectMap = CmmaContextActions.listSystemsInContext(contextMap)
    const systemsOnDisk = CmmaFileActions.listSubDirsInDir(diskContextDir)

    const systemsOnProjectMapButNotOnDisk = differenceOfArrays(systemsOnProjectMap, systemsOnDisk)

    if (systemsOnProjectMapButNotOnDisk.length) {
      this.logger.info(
        `${FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
          entityLabel: SYSTEM,
          entityCount: systemsOnProjectMapButNotOnDisk.length,
        })}. ${PRUNING_PROJECT_MAP}`
      )
    }

    systemsOnProjectMapButNotOnDisk.forEach((systemLabel) => {
      CmmaContextActions.deleteContextSystemByLabel({
        systemLabel,
        contextMap,
      })
    })

    if (systemsOnProjectMapButNotOnDisk.length) {
      this.logger.info(
        `${this.colors.cyan(
          ENTITY_PRUNED_FROM_PROJECT_MAP({
            entityLabel: SYSTEM,
            entityCount: systemsOnProjectMapButNotOnDisk.length,
          })
        )}`
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
    if (!CmmaFileActions.doesPathExist(this.projectRootPath)) {
      return
    }

    const diskContextsLabel = CmmaFileActions.listSubDirsInDir(this.projectRootPath)

    diskContextsLabel.forEach((diskContextLabel) => {
      return this.updateContextModules(diskContextLabel)
    })
  }

  private updateContextModules(diskContextLabel: string) {
    const contextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(contextDir)) {
      return
    }

    const contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel: diskContextLabel,
      projectMap: this.projectMap,
    })

    const diskSystemLabels = CmmaFileActions.listSubDirsInDir(contextDir)

    diskSystemLabels.forEach((diskSystemLabel) => {
      const systemMap = CmmaContextActions.getContextSystemMapByLabel({
        contextMap,
        systemLabel: diskSystemLabel,
      })

      this.addSystemModulesOnDiskToProjectMap({
        diskContextLabel,
        diskSystemLabel,
        systemMap,
      })

      this.pruneLooseSystemModulesFromProjectMap({
        diskContextLabel,
        diskSystemLabel,
        systemMap,
      })
    })
  }

  private addSystemModulesOnDiskToProjectMap(addSystemModulesOnDiskToProjectMapOptions: {
    diskSystemLabel: string
    systemMap: CmmaSystem
    diskContextLabel: string
  }) {
    const { diskSystemLabel, systemMap, diskContextLabel } =
      addSystemModulesOnDiskToProjectMapOptions

    const diskSystemRoutesDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .toSystem(diskSystemLabel)
      .toArtifactsDir('routes')
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(diskSystemRoutesDir)) return

    const routesOnDisk = CmmaFileActions.listRoutesInSystemRoutesDir(diskSystemRoutesDir)
    const projectRoutesSuffix =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'route',
        configObject: this.PROJECT_CONFIG,
      })

    const modulesOnDisk = routesOnDisk.map((routeLabel) => {
      return routeLabel.replace(projectRoutesSuffix.suffix!, '')
    })

    const modulesOnMap = CmmaSystemActions.listModulesInSystem(systemMap)

    const routesOnDiskButNotOnMap = differenceOfArrays(modulesOnDisk, modulesOnMap)

    if (routesOnDiskButNotOnMap.length) {
      if (routesOnDiskButNotOnMap.length) {
        this.logger.info(
          `${FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
            entityLabel: MODULE,
            entityCount: routesOnDiskButNotOnMap.length,
          })}. ${UPDATING_PROJECT_MAP}`
        )
      }
    }

    routesOnDiskButNotOnMap.forEach((moduleLabel) => {
      const module = CmmaModuleActions.blankModuleMap
      module.moduleLabel = moduleLabel

      CmmaSystemActions.addModuleToSystem({
        systemMap,
        module,
        moduleLabel,
      })
    })

    if (routesOnDiskButNotOnMap.length) {
      this.logger.info(
        `${this.colors.cyan(
          ENTITY_ADDED_TO_PROJECT_MAP({
            entityLabel: MODULE,
            entityCount: routesOnDiskButNotOnMap.length,
          })
        )}`
      )
    }
  }

  private pruneLooseSystemModulesFromProjectMap(pruneLooseContextModulesFromProjectMapOptions: {
    diskSystemLabel: string
    systemMap: CmmaSystem
    diskContextLabel: string
  }) {
    const { diskSystemLabel, systemMap, diskContextLabel } =
      pruneLooseContextModulesFromProjectMapOptions

    const modulesOnMap = CmmaSystemActions.listModulesInSystem(systemMap)

    const diskSystemRoutesDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .toSystem(diskSystemLabel)
      .toArtifactsDir('routes')
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(diskSystemRoutesDir)) return

    const routesOnDisk = CmmaFileActions.listRoutesInSystemRoutesDir(diskSystemRoutesDir)
    const projectRoutesSuffix =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'route',
        configObject: this.PROJECT_CONFIG,
      })

    const modulesOnDisk = routesOnDisk.map((routeLabel) => {
      return routeLabel.replace(projectRoutesSuffix.suffix!, '')
    })

    const routesOnMapButNotOnDisk = differenceOfArrays(modulesOnMap, modulesOnDisk)

    if (routesOnMapButNotOnDisk.length) {
      if (routesOnMapButNotOnDisk.length) {
        this.logger.info(
          `${FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
            entityLabel: MODULE,
            entityCount: routesOnMapButNotOnDisk.length,
          })}. ${PRUNING_PROJECT_MAP}`
        )
      }
    }

    routesOnMapButNotOnDisk.forEach((moduleLabel) => {
      const module = CmmaModuleActions.blankModuleMap
      module.moduleLabel = moduleLabel

      CmmaSystemActions.deleteModuleByLabel({
        systemMap,
        moduleLabel,
      })
    })

    if (routesOnMapButNotOnDisk.length) {
      this.logger.info(
        `${this.colors.cyan(
          ENTITY_PRUNED_FROM_PROJECT_MAP({
            entityLabel: MODULE,
            entityCount: routesOnMapButNotOnDisk.length,
          })
        )}`
      )
    }
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

    //
    // this.updateProjectArtifacts()

    await this.finishCmmaCommand()
  }
}
