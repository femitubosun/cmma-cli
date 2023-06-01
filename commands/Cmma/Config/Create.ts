import { flags } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import {
  CONFIGURATION_FILE_EXISTS,
  EXITING,
  PROCEEDING_WILL_OVERWRITE_CONFIG_FILE_CONTINUE,
} from '../../../cmma/Helpers/SystemMessages'
import CmmaFileActions from '../../../cmma/Actions/CmmaFileActions'
import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'

export default class ConfigCreate extends BaseCmmaCommand {
  /**
   * Ace Command Configuration
   */
  public static commandName = 'cmma:config-create'
  public static description = 'Create a CMMA Configuration file'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  @flags.boolean({ description: 'Create Empty CMMA Config file', alias: 'e' })
  public empty: boolean

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'cr'
  protected PROJECT_CONFIG = CmmaConfigurationActions.defaultCmmaConfiguration

  public async run() {
    if (this.projectConfigFileExists) {
      this.logger.warning(CONFIGURATION_FILE_EXISTS)

      const confirmProceed = await this.prompt.confirm(
        PROCEEDING_WILL_OVERWRITE_CONFIG_FILE_CONTINUE
      )

      if (!confirmProceed) {
        this.logger.info(EXITING)
        await this.exit()
      }
    }

    if (this.empty) {
      this.PROJECT_CONFIG = CmmaConfigurationActions.blankCmmaConfiguration
    }

    CmmaFileActions.ensureAFileExists(this.CONFIG_FILE_PATH)

    this.finishCmmaCommand()
  }
}
