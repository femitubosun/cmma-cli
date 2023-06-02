import { BaseCmmaAbstractArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaAbstractArtifactCommand'
import { args, flags } from '@adonisjs/core/build/standalone'
import CmmaAbstractArtifact from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaModuleActions from '../../../cmma/Actions/CmmaModuleActions'
import {
  EXITING,
  MODULE_NOT_FOUND_IN_PROJECT,
} from '../../../cmma/Helpers/SystemMessages/SystemMessages'

/*
|--------------------------------------------------------------------------------
| Operation Abstract Artifact
|
| Constituents: 'controller', 'validator'
|--------------------------------------------------------------------------------
|
*/
export default class Operation extends BaseCmmaAbstractArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | Ace Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-operation'
  public static description = 'Create a new CMMA Operation'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }
  /*
  |--------------------------------------------------------------------------------
  | Command Flags and Arguments
  |--------------------------------------------------------------------------------
  |
  */
  @args.string({ description: 'Name of the Operation to be Created' })
  public name: string

  @flags.string({ description: 'The name of the Module this operation belongs to', alias: 'm' })
  public module: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Specific Configurations
  |--------------------------------------------------------------------------------
  |
  */

  protected PROJECT_CONFIG = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|op'
  protected artifactLabel: string
  protected targetEntity = 'Operation'
  protected abstractArtifact: CmmaAbstractArtifact = ['controller', 'validator']

  /*
  |--------------------------------------------------------------------------------
  | Run Command
  |--------------------------------------------------------------------------------
  |
  */
  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    if (this.module) {
      this.module = CmmaConfigurationActions.normalizeProjectIdentifier({
        identifier: this.module,
        configObject: this.PROJECT_CONFIG,
      })
      const moduleNodePath = new CmmaNodePath(this.PROJECT_CONFIG).findModuleInProject(this.module)

      if (!moduleNodePath.length) {
        this.logger.error(`${this.module} ${MODULE_NOT_FOUND_IN_PROJECT} ${EXITING}`)

        await this.exit()
      }

      const confirmation = await this.prompt.confirm(
        `${this.colors.underline(this.module)} Module found in ${this.colors.underline(
          moduleNodePath.systemLabel!
        )} System in ${this.colors.underline(moduleNodePath.contextLabel!)} Context. Create ${
          this.name
        } Operation in Module?`
      )

      if (!confirmation) {
        this.logger.info(EXITING)

        await this.exit()
      }

      this.contextLabel = moduleNodePath.contextLabel!
      this.systemLabel = moduleNodePath.systemLabel!
      this.moduleLabel = moduleNodePath.moduleLabel!

      this.contextMap = CmmaProjectMapActions.getContextMapByLabel({
        contextLabel: this.contextLabel,
        projectMap: this.projectMap,
      })

      this.systemMap = CmmaContextActions.getContextSystemMapByLabel({
        systemLabel: this.systemLabel,
        contextMap: this.contextMap,
      })

      this.moduleMap = CmmaSystemActions.getModuleMapByLabel({
        moduleLabel: this.moduleLabel,
        systemMap: this.systemMap,
      })
    } else {
      await this.selectContextCommandStep()

      await this.selectSystemCommandStep()

      await this.selectModuleCommandStep()
    }

    this.artifactLabel = this.name

    const controllerTransformation =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'controller',
        configObject: this.PROJECT_CONFIG,
      })

    const controllerLabel = CmmaConfigurationActions.transformLabel({
      transformations: controllerTransformation,
      label: this.artifactLabel,
    })

    if (
      CmmaModuleActions.isControllerInModule({
        controllerLabel,
        moduleMap: this.moduleMap,
      })
    ) {
      this.logger.error(`${controllerLabel} is already in ${this.moduleLabel}. ${EXITING}`)

      await this.exit()
    }
    CmmaModuleActions.addModuleControllerToModule({
      moduleMap: this.moduleMap,
      controller: controllerLabel,
    })

    const validatorTransformation =
      CmmaConfigurationActions.getArtifactTypeTransformationWithoutExtension({
        artifactType: 'validator',
        configObject: this.PROJECT_CONFIG,
      })

    const validatorLabel = CmmaConfigurationActions.transformLabel({
      transformations: validatorTransformation,
      label: this.artifactLabel,
    })

    if (
      CmmaModuleActions.isValidatorInModule({
        validatorLabel,
        moduleMap: this.moduleMap,
      })
    ) {
      this.logger.error(`${controllerLabel} is already in ${this.moduleLabel}. ${EXITING}`)

      await this.exit()
    }

    CmmaModuleActions.addModuleValidatorToModule({
      moduleMap: this.moduleMap,
      validator: validatorLabel,
    })

    /**
     * Set Destination Directories
     */
    const validationDestinationNodePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('validators')
      .toModule(this.moduleLabel)

    const validatorDestinationDir = validationDestinationNodePath.getAbsoluteOsPath(
      this.application.appRoot
    )

    this.setArtifactDestinationDir({
      artifactType: 'validator',
      destinationDir: validatorDestinationDir,
    })

    const controllerDirNodePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .buildPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toArtifactsDir('controllers')
      .toModule(this.moduleLabel)
      .getAbsoluteOsPath(this.application.appRoot)

    this.setArtifactDestinationDir({
      artifactType: 'controller',
      destinationDir: controllerDirNodePath,
    })

    /**
     * Set template data
     */

    /**
     * Building Validator import string data
     */
    const validatorFileNodePath = validationDestinationNodePath
      .toArtifactsDir('validators')
      .toArtifactWithoutExtension({
        artifactLabel: this.artifactLabel,
        artifactType: 'validator',
      })

    const controllerTemplateData = {
      defaultDir: this.PROJECT_CONFIG.defaultProjectRootDirInApp,
      contextLabel: this.contextLabel,
      systemLabel: this.systemLabel,
      moduleLabel: this.moduleLabel,
      artifactGroupDir: validatorFileNodePath.artifactDirLabel!,
      validatorLabel: validatorFileNodePath.artifactLabel!,
    }

    this.setArtifactTemplateData({
      artifactType: 'controller',
      templateData: controllerTemplateData,
    })

    await this.generate()

    this.finishCmmaCommand()
  }
}
