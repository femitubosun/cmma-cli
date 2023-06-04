import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import differenceOfArrays from '../../../cmma/Helpers/Utils/symettericDifferenceOfArrays'
import {
  ARTIFACT,
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
import CmmaModule from '../../../cmma/Models/CmmaModule'
import CmmaArtifactDirs from '../../../cmma/TypeChecking/CmmaArtifactDirs'

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
    // TODO Refactor
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
    })

    const projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    projectContexts.forEach((contextLabel) => {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel,
        projectMap: this.projectMap,
      })

      this.pruneLooseContextSystemsFromProjectMap({
        contextLabel,
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
    contextLabel: string
    contextMap: CmmaContext
  }) {
    const { contextLabel, contextMap } = pruneLooseContextSystemsFromProjectMapOptions

    const diskContextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(contextLabel)
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

    // TODO A
    diskContextsLabel.forEach((diskContextLabel) => {
      return this.updateContextModules(diskContextLabel)
    })
  }

  // TODO ADD CONTEXTMAP TO PARAM
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
  | Update Project Module Artifacts
  |--------------------------------------------------------------------------------
  |
  */

  private updateProjectModuleArtifacts() {
    if (!CmmaFileActions.doesPathExist(this.projectRootPath)) {
      return
    }

    const diskContextsLabel = CmmaFileActions.listSubDirsInDir(this.projectRootPath)

    diskContextsLabel.forEach((diskContextLabel) => {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        projectMap: this.projectMap,
        contextLabel: diskContextLabel,
      })
      return this.updateContextModuleArtifacts({
        diskContextLabel,
        contextMap,
      })
    })
  }

  private updateContextModuleArtifacts(updateContextModuleArtifactsOptions: {
    diskContextLabel: string
    contextMap: CmmaContext
  }) {
    const { diskContextLabel, contextMap } = updateContextModuleArtifactsOptions

    const contextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(contextDir)) return

    const diskSystemLabels = CmmaFileActions.listSubDirsInDir(contextDir)

    diskSystemLabels.forEach((diskSystemLabel) => {
      const systemMap = CmmaContextActions.getContextSystemMapByLabel({
        contextMap,
        systemLabel: diskSystemLabel,
      })

      this.updateSystemModuleArtifacts({
        systemMap,
        diskSystemLabel,
        diskContextLabel,
      })
    })
  }

  private updateSystemModuleArtifacts(updateSystemModuleArtifactsOptions: {
    systemMap: CmmaSystem
    diskSystemLabel: string
    diskContextLabel: string
  }) {
    const { systemMap, diskSystemLabel, diskContextLabel } = updateSystemModuleArtifactsOptions

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

    modulesOnDisk.forEach((diskModuleLabel) => {
      const moduleMap = CmmaSystemActions.getModuleMapByLabel({
        moduleLabel: diskModuleLabel,
        systemMap,
      })

      this.addModuleArtifactOnDiskToProjectMap({
        moduleMap,
        diskContextLabel,
        diskModuleLabel,
        diskSystemLabel,
      })

      this.pruneLooseModuleArtifactFromProjectMap({
        moduleMap,
        diskContextLabel,
        diskModuleLabel,
        diskSystemLabel,
      })
    })
  }

  private addModuleArtifactOnDiskToProjectMap(addModuleArtifactOnDiskToProjectMapOptions: {
    diskModuleLabel: string
    diskSystemLabel: string
    moduleMap: CmmaModule
    diskContextLabel: string
  }) {
    const { diskModuleLabel, diskSystemLabel, moduleMap, diskContextLabel } =
      addModuleArtifactOnDiskToProjectMapOptions

    for (let moduleInDir of CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
      this.PROJECT_CONFIG
    )) {
      const moduleArtifactsDirOnDiskDir = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(diskContextLabel)
        .toSystem(diskSystemLabel)
        .toArtifactsDir(moduleInDir)
        .toModelDir(diskModuleLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      if (!CmmaFileActions.doesPathExist(moduleArtifactsDirOnDiskDir)) return

      const filesInArtifactDir = CmmaFileActions.listAllFilesInADirIncludingSubDirectories(
        moduleArtifactsDirOnDiskDir
      )

      const moduleArtifactsOnDisk = filesInArtifactDir
        .map((file) => file.split('.')[0])
        .filter((filename) => filename !== 'index')
      const moduleArtifactsOnMap = CmmaModuleActions.listModuleArtifactsByDirLabel({
        artifactDir: moduleInDir,
        moduleMap,
      })

      const artifactsOnDiskButNotOnMap = differenceOfArrays(
        moduleArtifactsOnDisk,
        moduleArtifactsOnMap
      )

      if (artifactsOnDiskButNotOnMap.length) {
        this.logger.info(
          FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
            entityLabel: ARTIFACT,
            entityCount: artifactsOnDiskButNotOnMap.length,
          })
        )
      }

      artifactsOnDiskButNotOnMap.forEach((artifactLabel) => {
        let artifact = CmmaArtifactActions.blankArtifact
        artifact = artifactLabel

        CmmaModuleActions.addArtifactToModule({
          artifact,
          artifactDirLabel: moduleInDir,
          moduleMap,
        })
      })

      if (artifactsOnDiskButNotOnMap.length) {
        this.logger.info(
          this.colors.cyan(
            ENTITY_ADDED_TO_PROJECT_MAP({
              entityLabel: ARTIFACT,
              entityCount: artifactsOnDiskButNotOnMap.length,
            })
          )
        )
      }
    }
  }

  private pruneLooseModuleArtifactFromProjectMap(pruneLooseModuleArtifactFromProjectMap: {
    diskModuleLabel
    diskSystemLabel
    moduleMap
    diskContextLabel
  }) {
    const { diskModuleLabel, diskSystemLabel, moduleMap, diskContextLabel } =
      pruneLooseModuleArtifactFromProjectMap

    for (let moduleInDir of CmmaConfigurationActions.whatIsDefaultCreateModuleDirIn(
      this.PROJECT_CONFIG
    )) {
      const moduleArtifactsDirOnDiskDir = new CmmaNodePath(this.PROJECT_CONFIG)
        .buildPath()
        .toContext(diskContextLabel)
        .toSystem(diskSystemLabel)
        .toArtifactsDir(moduleInDir)
        .toModelDir(diskModuleLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      if (!CmmaFileActions.doesPathExist(moduleArtifactsDirOnDiskDir)) return

      const moduleArtifactsOnMap = CmmaModuleActions.listModuleArtifactsByDirLabel({
        artifactDir: moduleInDir,
        moduleMap,
      })

      const filesInArtifactDir = CmmaFileActions.listAllFilesInADirIncludingSubDirectories(
        moduleArtifactsDirOnDiskDir
      )

      const moduleArtifactsOnDisk = filesInArtifactDir
        .map((file) => file.split('.')[0])
        .filter((filename) => filename !== 'index')

      const artifactsOnMapButNotOnDisk = differenceOfArrays(
        moduleArtifactsOnDisk,
        moduleArtifactsOnMap
      )

      if (artifactsOnMapButNotOnDisk.length) {
        this.logger.info(
          FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
            entityLabel: ARTIFACT,
            entityCount: artifactsOnMapButNotOnDisk.length,
          })
        )
      }

      artifactsOnMapButNotOnDisk.forEach((artifactLabel) => {
        CmmaModuleActions.deleteModuleArtifactFromArtifactDir({
          artifactDir: moduleInDir,
          moduleMap,
          artifactLabel,
        })
      })

      if (artifactsOnMapButNotOnDisk.length) {
        this.logger.info(
          this.colors.cyan(
            ENTITY_PRUNED_FROM_PROJECT_MAP({
              entityLabel: ARTIFACT,
              entityCount: artifactsOnMapButNotOnDisk.length,
            })
          )
        )
      }
    }
  }

  private updateProjectArtifacts() {
    if (!this.projectRootPath) return

    const diskContexts = CmmaFileActions.listSubDirsInDir(this.projectRootPath)

    diskContexts.forEach((diskContextLabel) => {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel: diskContextLabel,
        projectMap: this.projectMap,
      })

      this.updateContextArtifacts({
        contextMap,
        diskContextLabel,
      })
    })
  }

  private updateContextArtifacts(updateContextArtifactsOptions: {
    contextMap: CmmaContext
    diskContextLabel: string
  }) {
    const { contextMap, diskContextLabel } = updateContextArtifactsOptions

    const contextDirOnDisk = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(contextDirOnDisk)) return

    const diskSystems = CmmaFileActions.listSubDirsInDir(contextDirOnDisk)

    diskSystems.forEach((diskSystemLabel) => {
      const systemMap = CmmaContextActions.getContextSystemMapByLabel({
        systemLabel: diskSystemLabel,
        contextMap,
      })
      this.updateSystemArtifacts({
        systemMap,
        diskSystemLabel,
        diskContextLabel,
      })
    })
  }

  private updateSystemArtifacts(updateSystemArtifactsOptions: {
    systemMap: CmmaSystem
    diskSystemLabel: string
    diskContextLabel: string
  }) {
    const { systemMap, diskSystemLabel, diskContextLabel } = updateSystemArtifactsOptions

    const diskSystemDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .toSystem(diskSystemLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(diskSystemDir)) return

    const excludedDirs = ['routes', 'controllers', 'validators', 'seeders'].map((dirLabel) => {
      return CmmaConfigurationActions.transformLabel({
        label: dirLabel,
        transformations: {
          pattern: 'camelcase',
        },
      })
    })

    const artifactsDirs = CmmaFileActions.listSubDirsInDir(diskSystemDir)
      .map((dirLabel) => {
        return CmmaConfigurationActions.transformLabel({
          label: dirLabel,
          transformations: {
            pattern: 'camelcase',
          },
        })
      })
      .filter((subDir) => excludedDirs.indexOf(subDir) < 0) as Array<CmmaArtifactDirs>

    artifactsDirs.forEach((artifactDir) => {
      this.addSystemArtifactsOnDiskToProjectMap({
        diskArtifactDir: artifactDir,
        systemMap,
        diskSystemLabel,
        diskContextLabel,
      })
    })

    const artifactDirsOnMap = CmmaSystemActions.listSystemArtifactGroups(
      systemMap
    ) as Array<CmmaArtifactDirs>

    artifactDirsOnMap.forEach((artifactDir) => {
      this.pruneLooseSystemArtifactsFromProjectMap({
        diskArtifactDir: artifactDir,
        systemMap,
        diskContextLabel,
        diskSystemLabel,
      })
    })
  }

  private addSystemArtifactsOnDiskToProjectMap(addSystemArtifactsOnDiskToProjectMapOptions: {
    diskArtifactDir: CmmaArtifactDirs
    systemMap: CmmaSystem
    diskSystemLabel: string
    diskContextLabel: string
  }) {
    const { diskArtifactDir, systemMap, diskSystemLabel, diskContextLabel } =
      addSystemArtifactsOnDiskToProjectMapOptions

    const artifactDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .toSystem(diskSystemLabel)
      .toArtifactsDir(diskArtifactDir)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(artifactDir)) return

    const filesInArtifactDir =
      CmmaFileActions.listAllFilesInADirIncludingSubDirectories(artifactDir)

    const artifactsOnDisk = filesInArtifactDir
      .map((file) => file.split('.')[0])
      .filter((filename) => filename !== 'index')

    const artifactGroup = CmmaSystemActions.listSystemArtifactsByGroupLabel({
      artifactDir: diskArtifactDir,
      systemMap,
    })

    const artifactsOnDiskButNotOnMap = differenceOfArrays(artifactsOnDisk, artifactGroup)

    if (artifactsOnDiskButNotOnMap.length) {
      this.logger.info(
        FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP({
          entityLabel: ARTIFACT,
          entityCount: artifactsOnDiskButNotOnMap.length,
        })
      )
    }

    artifactsOnDiskButNotOnMap.forEach((artifactLabel) => {
      let artifact = CmmaArtifactActions.blankArtifact
      artifact = artifactLabel

      CmmaSystemActions.addArtifactToArtifactGroup({
        artifact,
        systemMap,
        artifactsDir: diskArtifactDir,
      })
    })

    if (artifactsOnDiskButNotOnMap.length) {
      this.logger.info(
        this.colors.cyan(
          ENTITY_ADDED_TO_PROJECT_MAP({
            entityLabel: ARTIFACT,
            entityCount: artifactsOnDiskButNotOnMap.length,
          })
        )
      )
    }
  }

  private pruneLooseSystemArtifactsFromProjectMap(pruneLooseSystemArtifactsFromProjectMapOptions: {
    diskArtifactDir: CmmaArtifactDirs
    systemMap: CmmaSystem
    diskSystemLabel: string
    diskContextLabel: string
  }) {
    const { diskArtifactDir, systemMap, diskSystemLabel, diskContextLabel } =
      pruneLooseSystemArtifactsFromProjectMapOptions

    const artifactGroup = CmmaSystemActions.listSystemArtifactsByGroupLabel({
      artifactDir: diskArtifactDir,
      systemMap,
    })

    const artifactDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(diskContextLabel)
      .toSystem(diskSystemLabel)
      .toArtifactsDir(diskArtifactDir)
      .getAbsoluteOsPath(this.application.appRoot)

    if (!CmmaFileActions.doesPathExist(artifactDir)) return

    const filesInArtifactDir =
      CmmaFileActions.listAllFilesInADirIncludingSubDirectories(artifactDir)

    const artifactsOnDisk = filesInArtifactDir
      .map((file) => file.split('.')[0])
      .filter((filename) => filename !== 'index')

    const artifactsOnMapButNotOnDisk = differenceOfArrays(artifactGroup, artifactsOnDisk)

    if (artifactsOnMapButNotOnDisk.length) {
      this.logger.info(
        FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK({
          entityLabel: ARTIFACT,
          entityCount: artifactsOnMapButNotOnDisk.length,
        })
      )
    }

    artifactsOnMapButNotOnDisk.forEach((artifactLabel) => {
      CmmaSystemActions.deleteArtifactObjectFromArtifactGroupByLabel({
        artifactLabel,
        systemMap,
        artifactDir: diskArtifactDir,
      })
    })

    if (artifactsOnMapButNotOnDisk.length) {
      this.logger.info(
        this.colors.cyan(
          ENTITY_PRUNED_FROM_PROJECT_MAP({
            entityLabel: ARTIFACT,
            entityCount: artifactsOnMapButNotOnDisk.length,
          })
        )
      )
    }
  }

  /*
  |--------------------------------------------------------------------------------
  | Update Project System Artifacts
  |--------------------------------------------------------------------------------
  |
  */

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

    if (!CmmaFileActions.doesPathExist(this.projectRootPath)) {
      await this.logger.error(`Project Path does not exist: ${this.projectRootPath}`)

      await this.exit()
    }

    this.updateProjectContexts()

    this.updateProjectSystems()

    this.updateProjectModules()

    this.updateProjectModuleArtifacts()

    this.updateProjectArtifacts()

    await this.finishCmmaCommand()
  }
}
