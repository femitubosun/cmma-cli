import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import differenceOfArrays from '../../../cmma/Helpers/Utils/symettericDifferenceOfArrays'
import { PRUNING } from '../../../cmma/Helpers/SystemMessages'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'

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
  | Update Project Map
  |--------------------------------------------------------------------------------
  |
  */
  public updateProjectContexts() {
    /**
     * Check for New Contexts in Project Directory
     */
    const directoryContexts = CmmaFileActions.listSubDirsInDir(this.projectRootPath)
    let projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    const contextsOnDiskButNotOnMap = differenceOfArrays(directoryContexts, projectContexts)

    this.logger.info(
      `${contextsOnDiskButNotOnMap.length} new Context(s) found: ${contextsOnDiskButNotOnMap} Updating...`
    )

    contextsOnDiskButNotOnMap.forEach((context) => {
      const normalizedLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
        configObject: this.PROJECT_CONFIG,
        identifier: String(context),
      })

      const defaultContext = CmmaContextActions.blankContext
      defaultContext.contextLabel = normalizedLabel

      CmmaProjectMapActions.addContextToProject({
        context: defaultContext,
        contextLabel: normalizedLabel,
        projectMap: this.projectMap,
      })
    })

    this.logger.info(`${contextsOnDiskButNotOnMap.length} Context(s) added to the Project Map`)

    // Contexts in Project Map that are not on disk

    projectContexts = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    const contextsInMapNotOnDisk = differenceOfArrays(projectContexts, directoryContexts)

    this.logger.info(
      `${contextsInMapNotOnDisk.length} context(s) found in Project Map but not on disk: ${contextsOnDiskButNotOnMap} ${PRUNING}`
    )

    contextsInMapNotOnDisk.forEach((context) => {
      CmmaProjectMapActions.deleteContextByLabel({
        contextLabel: context,
        projectMap: this.projectMap,
      })
    })

    this.logger.info(`${contextsInMapNotOnDisk.length} Context(s) pruned from the Project Map`)
  }

  public updateProjectSystems() {
    const contextLables = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    for (const contextLabel of contextLables) {
      const contextMap = CmmaProjectMapActions.getContextMapByLabel({
        projectMap: this.projectMap,
        contextLabel,
      })

      const systemsOnMap = CmmaContextActions.listSystemsInContext(contextMap)

      const contextPath = new CmmaNodePath(this.PROJECT_CONFIG)
        .drawPath()
        .toContext(contextLabel)
        .getAbsoluteOsPath(this.application.appRoot)

      const systemsOnDisk = CmmaFileActions.listSubDirsInDir(contextPath)

      const systemsOnDiskButNotInProject = differenceOfArrays(systemsOnDisk, systemsOnMap)

      this.logger.info(
        `${systemsOnDiskButNotInProject.length} new System(s) found in ${contextLabel} Context: ${systemsOnDiskButNotInProject} Updating Project Map...`
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

      const updatedSystems = CmmaContextActions.listSystemsInContext(contextMap)

      const systemsInProjectButNotOnDisk = differenceOfArrays(updatedSystems, systemsOnDisk)

      this.logger.info(
        `${systemsOnDiskButNotInProject.length} System(s) found in Project Map But not on Disk Context: ${systemsOnDiskButNotInProject} ${PRUNING}`
      )

      systemsInProjectButNotOnDisk.forEach((systemLabel) => {
        CmmaContextActions.deleteContextSystemByLabel({
          systemLabel,
          contextMap,
        })
      })

      this.logger.info(`${systemsInProjectButNotOnDisk.length} System(s) pruned from Project Map`)
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
      .drawPath()
      .getAbsoluteOsPath(this.application.appRoot)

    this.updateProjectContexts()

    this.updateProjectSystems()

    await this.finishCmmaCommand()
  }
}
