import { BaseCommand } from '@adonisjs/core/build/standalone'
import CmmaFileActions from '../Actions/CmmaFileActions'
import CmmaConfiguration from '../Models/CmmaConfiguration'
import CmmaProjectMap from '../Models/CmmaProjectMap'
import CmmaSystem from '../Models/CmmaSystem'
import CmmaContext from '../Models/CmmaContext'
import CmmaModule from '../Models/CmmaModule'
import CmmaProjectMapActions from '../Actions/CmmaProjectMapActions'
import {
  CREATE_CONFIG_COMMAND,
  EXITING,
  INIT_PROJECT_COMMAND,
  MAKE_CONTEXT_COMMAND,
  MAKE_MODULE_COMMAND,
  MAKE_SYSTEM_COMMAND,
  NO_DEFINED_CONTEXTS_IN_PROJECT,
  NO_DEFINED_MODULES_IN_SYSTEM,
  NO_DEFINED_SYSTEMS_IN_CONTEXT,
} from '../Helpers/SystemMessages/SystemMessages'
import CmmaContextActions from '../Actions/CmmaContextActions'
import CmmaSystemActions from '../Actions/CmmaSystemActions'

export abstract class BaseCmmaCommand extends BaseCommand {
  /*
  |--------------------------------------------------------------------------------
  | The name of the config file
  |--------------------------------------------------------------------------------
  |
  */
  protected CONFIG_FILE_NAME = 'cmma-config.json'

  /*
  |--------------------------------------------------------------------------------
  | THe filepath of the config file
  |--------------------------------------------------------------------------------
  |
  */
  protected CONFIG_FILE_PATH = CmmaFileActions.joinPath([
    this.application.appRoot,
    this.CONFIG_FILE_NAME,
  ])

  /*
  |--------------------------------------------------------------------------------
  | The Project Config Object
  |--------------------------------------------------------------------------------
  |
  */
  protected abstract PROJECT_CONFIG: CmmaConfiguration

  /*
  |--------------------------------------------------------------------------------
  | The Project Map
  |--------------------------------------------------------------------------------
  |
  */
  protected projectMap: CmmaProjectMap

  /*
  |--------------------------------------------------------------------------------
  | Command's Short code
  |--------------------------------------------------------------------------------
  |
  */
  protected abstract commandShortCode: string

  /*
  |--------------------------------------------------------------------------------
  | Command Arguments
  |--------------------------------------------------------------------------------
  |
  */
  protected commandArgs: Array<string | number> = []

  /*
  |--------------------------------------------------------------------------------
  | Entity Maps
  |--------------------------------------------------------------------------------
  |
  */
  protected contextMap: CmmaContext
  protected systemMap: CmmaSystem
  protected moduleMap: CmmaModule

  /*
  |--------------------------------------------------------------------------------
  | Entity Selections
  |--------------------------------------------------------------------------------
  |
  */
  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected abstract targetEntity: string

  /*
  |--------------------------------------------------------------------------------
  | Log a Complete Success Message
  |--------------------------------------------------------------------------------
  |
  */
  protected logCompleteSuccessMessage(message: string) {
    this.logger.success(`${message}. Happy Coding 🚀 -- ${this.colors.dim(this.author)}`)
  }

  /*
  |--------------------------------------------------------------------------------
  | Check if config file exists
  |--------------------------------------------------------------------------------
  |
  */
  protected get projectConfigFileExists() {
    return CmmaFileActions.doesPathExist(this.CONFIG_FILE_PATH)
  }

  /*
  |--------------------------------------------------------------------------------
  | Necessary Pre Command Actions
  |--------------------------------------------------------------------------------
  |
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

  /*
  |--------------------------------------------------------------------------------
  | Necessary Post Command Actions
  |--------------------------------------------------------------------------------
  |
  */
  protected finishCmmaCommand() {
    this.logCommand()

    CmmaFileActions.writeConfigObjectToConfigFile({
      configObject: this.PROJECT_CONFIG,
      configFilePath: this.CONFIG_FILE_PATH,
    })

    this.logCompleteSuccessMessage(this.PROJECT_CONFIG.logs[this.PROJECT_CONFIG.logs.length - 1])
  }

  /*
  |--------------------------------------------------------------------------------
  | Add a command log into the Project logs
  |--------------------------------------------------------------------------------
  |
  */
  protected logCommand() {
    const commandArgs = this.commandArgs.join('|')
    this.PROJECT_CONFIG.logs.push(`${this.commandShortCode}|${commandArgs}`)
  }

  /*
  |--------------------------------------------------------------------------------
  | Get Profile Configuration from config.json file
  |--------------------------------------------------------------------------------
  |
  */
  protected get projectConfigurationFromFile(): CmmaConfiguration | null {
    return this.projectConfigFileExists
      ? CmmaFileActions.getConfigurationObjectFromFilePath(this.CONFIG_FILE_PATH)
      : null
  }

  /*
  |--------------------------------------------------------------------------------
  | Ensure Config File Exists Step in Commands
  |--------------------------------------------------------------------------------
  |
  */
  protected async ensureConfigFileExistsCommandStep() {
    /**
     * Ensure Configuration File Exists
     */
    if (!this.projectConfigFileExists) {
      this.logger.error(
        `Config file: ${this.colors.cyan(
          this.CONFIG_FILE_NAME
        )} does not exist. Run ${CREATE_CONFIG_COMMAND} first. ${EXITING}`
      )
      await this.exit()
    }

    this.projectMap = this.PROJECT_CONFIG.projectMap
  }

  /*
  |--------------------------------------------------------------------------------
  | Select Context Step in Commands
  |--------------------------------------------------------------------------------
  |
  */
  protected async selectContextCommandStep() {
    const projectContextLabels = CmmaProjectMapActions.listContextsInProject(this.projectMap)

    if (!projectContextLabels.length) {
      this.logger.error(
        `${NO_DEFINED_CONTEXTS_IN_PROJECT}. Run ${this.colors.cyan(
          INIT_PROJECT_COMMAND
        )} or ${this.colors.cyan(MAKE_CONTEXT_COMMAND)} first. ${EXITING}`
      )
      await this.exit()
    }

    this.contextLabel = await this.prompt.choice(
      `What Context does this ${this.targetEntity} belong to?`,
      projectContextLabels
    )

    this.contextMap = CmmaProjectMapActions.getContextMapByLabel({
      contextLabel: this.contextLabel,
      projectMap: this.projectMap!,
    })
  }

  /*
  |--------------------------------------------------------------------------------
  | Select System Step in Commands
  |--------------------------------------------------------------------------------
  |
  */
  protected async selectSystemCommandStep() {
    const contextSystemLabels = CmmaContextActions.listSystemsInContext(this.contextMap)

    if (!contextSystemLabels.length) {
      this.logger.error(
        `${NO_DEFINED_SYSTEMS_IN_CONTEXT}. Run ${this.colors.cyan(
          MAKE_SYSTEM_COMMAND
        )} first. ${EXITING}`
      )
      await this.exit()
    }

    this.systemLabel = await this.prompt.choice(
      `What System does this  ${this.targetEntity} belong to?`,
      contextSystemLabels
    )

    this.systemMap = CmmaContextActions.getContextSystemMapByLabel({
      systemLabel: this.systemLabel,
      contextMap: this.contextMap,
    })
  }

  protected async selectModuleCommandStep() {
    const systemModules = CmmaSystemActions.listModulesInSystem(this.systemMap)

    if (!systemModules.length) {
      this.logger.error(
        `${NO_DEFINED_MODULES_IN_SYSTEM}. Run ${this.colors.cyan(
          MAKE_MODULE_COMMAND
        )} first. ${EXITING}`
      )
      await this.exit()
    }

    this.moduleLabel = await this.prompt.choice(
      `What Module does this ${this.targetEntity} belong to`,
      systemModules
    )

    this.moduleMap = CmmaSystemActions.getModuleMapByLabel({
      moduleLabel: this.moduleLabel,
      systemMap: this.systemMap,
    })
  }

  /*
  |--------------------------------------------------------------------------------
  | FATE 🍂
  |--------------------------------------------------------------------------------
  |
  */
  protected get author() {
    return 'FATE.'
  }
}
