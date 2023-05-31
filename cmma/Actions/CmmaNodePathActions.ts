import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaNodePath from '../Models/CmmaNodePath'
import CmmaContextActions from './CmmaContextActions'
import CmmaProjectMapActions from './CmmaProjectMapActions'

export default class CmmaNodePathActions {
  /**
   * @description What Is System Migrations Directory Node Path
   * @author FATE
   * @param {} whatIsSystemMigrationsDirectoryNodePathOptions
   */
  public static getSystemMigrationsNodePath(whatIsSystemMigrationsDirectoryNodePathOptions: {
    systemLabel: string
    contextLabel: string
    configObject: CmmaConfiguration
  }) {
    const { systemLabel, configObject, contextLabel } =
      whatIsSystemMigrationsDirectoryNodePathOptions

    return new CmmaNodePath(configObject)
      .buildPathFromNullNode()
      .toContext(contextLabel)
      .toSystem(systemLabel)
      .toSystemArtifactsDir('migrations')
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

    const contextMap = CmmaProjectMapActions.getContextObjectByLabel({
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

  public static listProjectMigrationsDirectoryNodePath(
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
}
