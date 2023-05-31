import { BaseCommand } from '@adonisjs/core/build/standalone'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaNodePath from '../Models/CmmaNodePath'
import CmmaConfigurationActions from '../Actions/CmmaConfigurationActions'

export abstract class BaseCmmaCommand extends BaseCommand {
  /**
   * CMMA Configuration
   */
  protected CONFIG_FILE_NAME = 'cmma-config.json'
  protected CONFIG_FILE_PATH = CmmaFileActions.joinPath([
    this.application.appRoot,
    this.CONFIG_FILE_NAME,
  ])
  protected abstract PROJECT_CONFIG: CmmaConfiguration

  protected abstract commandShortCode: string
  protected commandArgs: Array<string | number> = []

  /**
   * @description Method to log a success message after CMMA Command Executes Successfully
   * @param message
   * @protected
   * @author FATE
   */
  protected logCompleteSuccessMessage(message: string) {
    this.logger.success(`${message}. Happy Coding 🚀 -- ${this.colors.dim(this.author)}`)
  }

  /**
   * @description Does CMMA Configuration File Exist
   * @protected
   * @author FATE
   */
  protected get projectConfigFileExists() {
    return CmmaFileActions.doesPathExist(this.CONFIG_FILE_PATH)
  }

  /**
   * @description Necessary Pre Command Actions
   * @author FATE
   * @param
   */
  protected async startCmmaCommand() {
    /**
     * Ensure Configuration File Exists
     */
    if (!this.projectConfigFileExists) {
      this.logger.error(
        `Config file: ${this.colors.cyan(
          this.CONFIG_FILE_NAME
        )} does not exist. Run ${this.colors.cyan('node ace cmma:init')} first. Exiting...`
      )
      await this.exit()
    }
  }

  /**
   * @description Necessary Post-Command Actions
   * @protected
   * @author FATE
   */
  protected finishCmmaCommand() {
    this.logCommand()

    CmmaFileActions.writeConfigObjectToConfigFile({
      configObject: this.PROJECT_CONFIG,
      configFilePath: this.CONFIG_FILE_PATH,
    })

    this.logCompleteSuccessMessage(this.PROJECT_CONFIG.logs[this.PROJECT_CONFIG.logs.length - 1])
  }

  /**
   * @description Log a command into Project
   * @protected
   * @author FATE
   */
  protected logCommand() {
    const commandArgs = this.commandArgs.join('|')
    this.PROJECT_CONFIG.logs.push(`${this.commandShortCode}|${commandArgs}`)
  }

  /**
   * @description Project CMMA Configuration
   * @protected
   * @author FATE
   */
  protected get projectConfiguration(): CmmaConfiguration | null {
    return this.projectConfigFileExists
      ? CmmaFileActions.getConfigurationObjectFromFilePath(this.CONFIG_FILE_PATH)
      : null
  }

  protected createAbsolutePathFromNodePath(nodePath: CmmaNodePath): string {
    return CmmaFileActions.createAbsolutePathFromNodePath({
      applicationRoot: this.application.appRoot,
      projectRootDirInApp: CmmaConfigurationActions.whatIsDefaultProjectRootInApp(
        this.PROJECT_CONFIG
      ),
      nodePath,
    })
  }

  protected async ensureConfigFileExistsCommandStep() {
    /**
     * Ensure Configuration File Exists
     */
    if (!this.projectConfigFileExists) {
      this.logger.error(
        `Config file: ${this.colors.cyan(
          this.CONFIG_FILE_NAME
        )} does not exist. Run ${this.colors.cyan('node ace cmma:init')} first. Exiting...`
      )
      await this.exit()
    }
  }

  /**
   * @description
   * @author FATE
   * @param nodePath
   */
  public static createRelativePathFromNodePath(nodePath: CmmaNodePath) {
    return CmmaFileActions.createRelativeFilePathFromNodePath({ nodePath })
  }

  /**
   * @description FATE.🍂
   * @protected
   * @author FATE
   */
  protected get author() {
    return 'FATE.'
  }
}
