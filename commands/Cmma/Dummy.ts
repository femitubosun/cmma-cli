import { args } from '@adonisjs/core/build/standalone'
import { BaseCmmaCommand } from '../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMap from '../../cmma/Models/CmmaProjectMap'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'

export default class Dummy extends BaseCmmaCommand {
  /**
   * COMMAND Metadata
   */
  public static commandName = 'cmma:dummy'
  public static description = 'Dummy CMMA for testing purposes'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  protected projectMap: CmmaProjectMap
  protected targetEntity: string

  @args.string({ description: 'Name of the Dummy to be Dummied' })
  public name: string

  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode: string

  public async run() {
    const jsonFiles = CmmaFileActions.listFilesInDir(
      CmmaFileActions.joinPath(CmmaFileActions.getCmmaTemplatesDir(this.application.appRoot))
    )

    console.log(jsonFiles)

    this.logger.info(`${this.name} success`)
  }
}
