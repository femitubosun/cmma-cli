import CmmaConfiguration from '../Models/CmmaConfiguration'
import CmmaNodePath from '../Models/CmmaNodePath'
import CmmaContextActions from './CmmaContextActions'
import CmmaProjectMapActions from './CmmaProjectMapActions'

export default class CmmaNodePathActions {
  /**
   * @description What Is System Migrations Directory Node Path
   * @author FATE
   * @param getSystemMigrationsNodePathOptions
   */
  public static getSystemMigrationsNodePath(getSystemMigrationsNodePathOptions: {
    systemLabel: string
    contextLabel: string
    configObject: CmmaConfiguration
  }) {
    const { systemLabel, configObject, contextLabel } = getSystemMigrationsNodePathOptions

    return new CmmaNodePath(configObject)
      .buildPath()
      .toContext(contextLabel)
      .toSystem(systemLabel)
      .toArtifactsDir('migrations')
  }

  /**
   * @description What is System's Seeders Directory Node Path
   * @author FATE
   * @param {} getSystemSeedersNodePathOptions
   */
  public static getSystemSeedersNodePath(getSystemSeedersNodePathOptions: {
    systemLabel: string
    contextLabel: string
    configObject: CmmaConfiguration
  }) {
    const { systemLabel, configObject, contextLabel } = getSystemSeedersNodePathOptions

    return new CmmaNodePath(configObject)
      .buildPath()
      .toContext(contextLabel)
      .toSystem(systemLabel)
      .toArtifactsDir('seeders')
  }

  /**
   * @description List the Migrations Directories' Node Paths in a Context
   * @author FATE
   * @param {} listContextMigrationDirectoriesNodePathsOptions
   */
  public static listContextMigrationsNodePaths(listContextMigrationDirectoriesNodePathsOptions: {
    contextLabel: string
    configObject: CmmaConfiguration
  }): Array<CmmaNodePath> {
    const { contextLabel, configObject } = listContextMigrationDirectoriesNodePathsOptions

    const contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel,
      projectMap: configObject.projectMap,
    })

    const systemContextLabels = CmmaContextActions.listSystemsInContext(contextMap)

    return systemContextLabels.map((systemLabel) =>
      this.getSystemMigrationsNodePath({
        systemLabel,
        contextLabel,
        configObject,
      })
    )
  }

  /**
   * @description List a Context's Seeders Directories' Node Path
   * @author FATE
   * @param {} listContextSeedersNodePathOptions
   */
  public static listContextSeedersNodePath(listContextSeedersNodePathOptions: {
    contextLabel: string
    configObject: CmmaConfiguration
  }) {
    const { contextLabel, configObject } = listContextSeedersNodePathOptions

    const contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel,
      projectMap: configObject.projectMap,
    })

    const systemContextLabels = CmmaContextActions.listSystemsInContext(contextMap)

    return systemContextLabels.map((systemLabel) =>
      this.getSystemSeedersNodePath({
        systemLabel,
        contextLabel,
        configObject,
      })
    )
  }

  public static listProjectMigrationsDirectoriesNodePaths(
    configObject: CmmaConfiguration
  ): Array<CmmaNodePath> {
    const projectContexts = CmmaProjectMapActions.listContextsInProject(configObject.projectMap)

    return projectContexts
      .map((contextLabel) =>
        this.listContextMigrationsNodePaths({
          contextLabel,
          configObject,
        })
      )
      .flat()
  }

  public static listProjectSeedersDirectoriesNodePaths(
    configObject: CmmaConfiguration
  ): Array<CmmaNodePath> {
    const projectContexts = CmmaProjectMapActions.listContextsInProject(configObject.projectMap)

    return projectContexts
      .map((contextLabel) =>
        this.listContextSeedersNodePath({
          contextLabel,
          configObject,
        })
      )
      .flat()
  }
}
