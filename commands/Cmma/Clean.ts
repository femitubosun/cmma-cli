import { removeSync } from 'fs-extra'
import { flags } from '@adonisjs/core/build/standalone'
import CmmaConfigurationActions from '../../cmma/Actions/CmmaConfigurationActions'
import { BaseCmmaCommand } from '../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaNodePath from '../../cmma/Models/CmmaNodePath'
import CmmaFileActions from '../../cmma/Actions/CmmaFileActions'
import CmmaConfiguration from '../../cmma/Models/CmmaConfiguration'
import { EXITING } from '../../cmma/Helpers/SystemMessages/SystemMessages'
import CmmaProjectMap from '../../cmma/Models/CmmaProjectMap'

export default class Clean extends BaseCmmaCommand {
  /*
 |--------------------------------------------------------------------------------
 | ACE Command Configuration
 |--------------------------------------------------------------------------------
 |
 */
  public static commandName = 'cmma:clean'
  public static description =
    'Delete Default Context Directory and config file. This is a debug command, use with caution.'
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
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected projectMap: CmmaProjectMap
  protected commandShortCode = 'mk|act'
  protected targetEntity = 'Project'

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
        this.logger.info(EXITING)

        await this.exit()
      }
    }

    console.log(this.PROJECT_CONFIG)

    const nodePath = new CmmaNodePath(this.PROJECT_CONFIG).buildPath()

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
