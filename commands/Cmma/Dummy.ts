import { args } from '@adonisjs/core/build/standalone'
import { BaseCmmaCommand } from '../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaProjectMap from '../../cmma/Models/CmmaProjectMap'

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

  @args.string({ description: 'Name of the Dummy to be Dummied' })
  public name: string

  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode: string

  public async run() {
    /**
     *  ENSURE Config file Exists
     */
    await this.ensureConfigFileExistsCommandStep()

    this.logger.info('Dummy Success')
  }

  protected projectMap: CmmaProjectMap
  protected targetEntity: string
}
