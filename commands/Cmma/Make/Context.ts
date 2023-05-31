import { BaseCmmaBoundaryCommand } from '../../../cmma/BaseCommands/BaseCmmaBoundaryCommand'
import CmmaConfiguration from '../../../cmma/TypeChecking/CmmaConfiguration'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import { args } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

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
    defaultContextObject.contextLabel = this.contextLabel

    CmmaProjectMapActions.addContextToProject({
      projectMap,
      contextLabel: this.contextLabel,
      context: defaultContextObject,
    })

    /**
     * Generate Context Files
     */

    const contextDir = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toContext(this.contextLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    this.generator
      .addFile(
        this.contextLabel,
        CmmaConfigurationActions.getArtifactGroupTransformation({
          artifactGroup: 'routes',
          configObject: this.PROJECT_CONFIG,
        })
      )
      .destinationDir(contextDir)

    await this.generator.run()

    /**
     * Import Context To Project
     */

    const projectRoutesFile = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toArtifact({
        artifactLabel: 'Project',
        artifactType: 'route',
      })
      .getAbsoluteOsPath(this.application.appRoot)

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
      filePath: projectRoutesFile,
      text: importContextString,
    })

    this.logger.action('update').succeeded(projectRoutesFile)

    /**
     * Finish Command
     */

    this.commandArgs = [CmmaProjectMapActions.listContextsInProject(projectMap).length - 1]
    this.finishCmmaCommand()
  }
}
