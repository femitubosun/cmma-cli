import { BaseCmmaBoundaryCommand } from '../../../cmma/CommandBase/BaseCmmaBoundaryCommand'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaContext from '../../../cmma/Models/CmmaContext'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaNodeMap from '../../../cmma/Models/CmmaNodeMap'

export default class Context extends BaseCmmaBoundaryCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:make-context'
  public static description = 'Create a new CMMA Context'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * Command Arguments
   */
  @args.string({ description: 'Name of the Context to be Created' })
  public name: string

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'mk|con'
  protected boundaryObject: CmmaContext
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!
  private contextLabel: string

  public async run() {
    await this.startCmmaCommand()
    /**
     * Project Map Defined as Early As Possible
     */

    const projectMap = this.PROJECT_CONFIG.projectMap

    /**
     * Check if Context is Already In Project
     */
    this.contextLabel = CmmaConfigurationActions.normalizeProjectIdentifier({
      identifier: this.name,
      configObject: this.PROJECT_CONFIG,
    })

    if (
      CmmaProjectMapActions.isContextInProject({
        projectMap,
        contextLabel: this.contextLabel,
      })
    ) {
      this.logger.warning('You have already registered this Context. Ignoring...')
      await this.exit()
    }

    /**
     * Add Context To Project
     */
    const defaultContextObject = CmmaContextActions.blankContext

    CmmaProjectMapActions.addContextToProject({
      projectMap,
      contextLabel: this.contextLabel,
      context: defaultContextObject,
    })

    /**
     * Generate Context Files
     */

    const contextRouteFileDestinationNodePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toContext(this.contextLabel)

    const contextFileDestinationPath = this.createAbsolutePathFromNodePath(
      contextRouteFileDestinationNodePath
    )

    this.generator
      .addFile(
        this.contextLabel,
        CmmaConfigurationActions.getArtifactGroupTransformation({
          artifactGroup: 'routes',
          configObject: this.PROJECT_CONFIG,
        })
      )
      .destinationDir(contextFileDestinationPath)

    await this.generator.run()

    /**
     * Import Context To Project
     */

    const projectRoutesNodePath = new CmmaNodeMap(this.PROJECT_CONFIG)
      .buildPathFromNullNode()
      .toArtifact({
        artifactLabel: this.PROJECT_CONFIG.defaultProjectRoutesFileName,
        artifactType: 'routes',
      })

    const projectRoutesFilePath = this.createAbsolutePathFromNodePath(projectRoutesNodePath)

    const contextRoutesFileName = CmmaConfigurationActions.transformLabel({
      label: this.contextLabel,
      transformations: CmmaConfigurationActions.getArtifactGroupTransformation({
        artifactGroup: 'routes',
        configObject: this.PROJECT_CONFIG,
      }),
      noExt: true,
    })

    const importContextString = `import './${this.contextLabel}/${contextRoutesFileName}'`

    CmmaFileActions.appendToFile({
      filePath: projectRoutesFilePath,
      text: importContextString,
    })

    this.logger.action('update').succeeded(projectRoutesFilePath)

    /**
     * Finish Command
     */

    this.commandArgs = [CmmaProjectMapActions.listContextsInProject(projectMap).length - 1]
    this.finishCmmaCommand()
  }
}
