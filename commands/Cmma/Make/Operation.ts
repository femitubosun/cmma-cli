import { BaseCmmaAbstractArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaAbstractArtifactCommand'
import { args, flags } from '@adonisjs/core/build/standalone'
import CmmaAbstractArtifact from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaArtifactType from '../../../cmma/TypeChecking/CmmaArtifactType'
import CmmaProjectMapActions from '../../../cmma/Actions/CmmaProjectMapActions'
import CmmaContextActions from '../../../cmma/Actions/CmmaContextActions'
import CmmaSystemActions from '../../../cmma/Actions/CmmaSystemActions'
import CmmaNodePath from '../../../cmma/Models/CmmaNodePath'

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

  @flags.string({ description: 'The name of the System this operation belongs to' })
  public system: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Specific Configurations
  |--------------------------------------------------------------------------------
  |
  */
  protected commandShortCode = 'mk|op'
  protected PROJECT_CONFIG = this.projectConfiguration!

  protected contextLabel: string
  protected systemLabel: string
  protected moduleLabel: string
  protected artifactLabel: string
  protected abstractArtifact: CmmaAbstractArtifact = [
    {
      artifactType: 'controller',
      artifactGroup: 'controllers',
    },
    {
      artifactType: 'validator',
      artifactGroup: 'validators',
    },
  ]

  protected artifactStubs: Record<CmmaArtifactType, string> = {
    'controller': 'operation-controllers.txt',
    'validator': 'operation-validators.txt',
    'view': '',
    'create-typechecking': '',
    'update-typechecking': '',
    'file': '',
    'model': '',
    'migration': '',
    'action': '',
    'route': '',
    'index': '',
  }

  protected destinationDirs = {
    controller: '',
    validator: '',
  }

  protected templateData = {
    controller: {
      defaultDir: '',
      contextLabel: '',
      systemLabel: '',
      artifactGroupDir: '',
      moduleLabel: '',
      artifactLabel: '',
      validatorLabel: '',
    },
    validator: {},
  }

  /*
  |--------------------------------------------------------------------------------
  | Run Command
  |--------------------------------------------------------------------------------
  |
  */
  public async run() {
    await this.startCmmaCommand()
    /**
     * Project Map Defined as Early As Possible
     */
    const projectMap = this.PROJECT_CONFIG.projectMap

    const projectContextLabels = CmmaProjectMapActions.listContextsInProject(projectMap)

    if (!projectContextLabels.length) {
      this.logger.error(
        `There are no defined Contexts in this Project. Run ${this.colors.cyan(
          'node ace cmma:init'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.contextLabel = await this.prompt.choice(
      'What Context does this Module belong to?',
      projectContextLabels
    )

    const contextMap = CmmaProjectMapActions.getContextObjectByLabel({
      contextLabel: this.contextLabel,
      projectMap,
    })

    const contextSystemLabels = CmmaContextActions.listSystemsInContext(contextMap)

    if (!contextSystemLabels.length) {
      this.logger.error(
        `There are no defined Systems in Context. Run ${this.colors.cyan(
          'node ace cmma:make-system'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.systemLabel = await this.prompt.choice(
      'What System does this Operation Belong to?',
      contextSystemLabels
    )

    const systemMap = CmmaContextActions.getContextSystemObjectByLabel({
      systemLabel: this.systemLabel,
      contextMap,
    })

    const systemModules = CmmaSystemActions.listModulesInSystem(systemMap)

    if (!systemModules.length) {
      this.logger.error(
        `There are no defined Modules in Context. Run ${this.colors.cyan(
          'node ace cmma:make-module'
        )} first. Exiting...`
      )
      await this.exit()
    }

    this.moduleLabel = await this.prompt.choice(
      `What Module does this Operation belong to`,
      systemModules
    )

    // const moduleMap = CmmaSystemActions.getModuleByLabel({
    //   moduleLabel: this.moduleLabel,
    //   systemMap,
    // })

    //  TODO Add Artifacts to Module
    // Add Create Options to System as well

    this.artifactLabel = this.name

    const controllerDirNodePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('controllers')
      .toModelDir(this.moduleLabel)

    this.destinationDirs.controller = controllerDirNodePath.getAbsoluteOsPath(
      this.application.appRoot
    )

    this.templateData.controller.defaultDir = this.PROJECT_CONFIG.defaultProjectRootDirInApp
    this.templateData.controller.contextLabel = this.contextLabel
    this.templateData.controller.systemLabel = this.systemLabel

    this.templateData.controller.moduleLabel = this.moduleLabel

    const validatorDirNodePath = new CmmaNodePath(this.PROJECT_CONFIG)
      .drawPath()
      .toContext(this.contextLabel)
      .toSystem(this.systemLabel)
      .toSystemArtifactsDir('validators')
      .toModelDir(this.moduleLabel)

    this.destinationDirs.validator = validatorDirNodePath.getAbsoluteOsPath(
      this.application.appRoot
    )

    validatorDirNodePath.toArtifact({
      artifactType: 'validator',
      artifactLabel: this.artifactLabel,
      noExt: true,
    })

    this.templateData.controller.artifactGroupDir = validatorDirNodePath.artifactDirLabel!
    this.templateData.controller.validatorLabel = validatorDirNodePath.artifactLabel!

    await this.generate()

    this.finishCmmaCommand()
  }
}
