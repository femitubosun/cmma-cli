import { removeSync } from 'fs-extra'
import { flags } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../cmma/Actions/CmmaConfigurationActions'
import { BaseCmmaCommand } from '../../cmma/CommandBase/BaseCmmaCommand'
import CmmaNodeMap from '../../cmma/Models/CmmaNodeMap'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'
import CmmaConfiguration from '../../cmma/TypeChecking/CmmaConfiguration'

export default class Clean extends BaseCmmaCommand {
  public static commandName = 'cmma:clean'
  public static description =
    'Delete Default Context Directory and config file. This is a debug command, use with caution.'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /**
   * CMMA Configurations
   */
  protected commandShortCode = 'cl'
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfiguration!

  // COMMAND FLAGS
  @flags.boolean({
    alias: 'e',
    description: 'Exclude CMMA config in clean',
  })
  public excludeConfig: boolean = false

  @flags.boolean({
    alias: 'y',
    description: 'Response yes to confirmation',
  })
  public yes: boolean = false

  public async run() {
    if (!this.projectConfigFileExists) {
      this.logger.error(
        `Config file: ${this.colors.cyan(
          this.CONFIG_FILE_NAME
        )} does not exist. Cannot Clean. Exiting...`
      )
      await this.exit()
    }

    const cleaningHasBeenConfirmed = this.yes

    if (!cleaningHasBeenConfirmed) {
      const verifyClean = await this.prompt.confirm('Are you sure you want to Clean CMMA?')

      if (!verifyClean) {
        this.logger.info('Exiting...')
      }
    }

    const nodePath = new CmmaNodeMap(this.PROJECT_CONFIG).buildPathFromNullNode()
    console.log(this.PROJECT_CONFIG)

    const projectRootPath = CmmaFileActions.createAbsolutePathFromNodePath({
      applicationRoot: this.application.appRoot,
      projectRootDirInApp: CmmaConfigurationActions.whatIsDefaultProjectRootInApp(
        this.PROJECT_CONFIG
      ),
      nodePath,
    })

    removeSync(projectRootPath)
    this.logger.action('delete').succeeded(projectRootPath)

    if (!this.excludeConfig) {
      removeSync(this.CONFIG_FILE_PATH)
      this.logger.action('delete').succeeded(this.CONFIG_FILE_PATH)
    }
  }
}
