import { BaseCmmaAbstractArtifactCommand } from '../../../cmma/BaseCommands/BaseCmmaAbstractArtifactCommand'
import { args } from '@adonisjs/core/build/standalone'
import CmmaAbstractArtifact from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifact'
import CmmaConfigurationActions from '../../../cmma/Actions/CmmaConfigurationActions'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import CmmaAbstractArtifactEnum from '../../../cmma/TypeChecking/AbstractArtifact/CmmaAbstractArtifactEnum'
import { string } from '@ioc:Adonis/Core/Helpers'

/*
|--------------------------------------------------------------------------------
| Operation Abstract Artifact
|
| Constituents: 'controller', 'validator'
|--------------------------------------------------------------------------------
|
*/
export default class ModelOptions extends BaseCmmaAbstractArtifactCommand {
  /*
  |--------------------------------------------------------------------------------
  | ACE Command Configuration
  |--------------------------------------------------------------------------------
  |
  */
  public static commandName = 'cmma:make-db-model'
  public static description = 'Create a new CMMA Model Options'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  /*
  |--------------------------------------------------------------------------------
  | Command Arguments
  |--------------------------------------------------------------------------------
  |
  */
  @args.string({ description: 'Name of the Model to be Created' })
  public name: string

  /*
  |--------------------------------------------------------------------------------
  | CMMA Specific Configurations
  |--------------------------------------------------------------------------------
  |
  */
  /*
  |--------------------------------------------------------------------------------
  | CMMA Configuration
  |--------------------------------------------------------------------------------
  |
  */
  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'mk|dbm'
  protected artifactLabel: string
  protected abstractArtifactType: CmmaAbstractArtifactEnum = 'db-model'
  protected targetEntity = 'Db Model'
  protected abstractArtifactConstituents: CmmaAbstractArtifact = ['model', 'migration']

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    this.artifactLabel = this.name

    await this.selectContextCommandStep()

    await this.selectSystemCommandStep()

    await this.addArtifactsToProjectMapCommandStep()

    this.setArtifactsTransformationsCommandStep()

    this.setArtifactDestinationPathCommandStep()

    for (let artifactType of this.abstractArtifactConstituents) {
      if (artifactType === 'migration') {
        const tableName = CmmaConfigurationActions.transformLabel({
          label: this.name,
          transformations: {
            pattern: 'camelcase',
            form: 'plural',
          },
        })

        this.setArtifactTemplateData({
          artifactType,
          templateData: {
            toClassName() {
              return function () {
                const migrationClassName = string.camelCase(tableName)
                return `${migrationClassName.charAt(0).toUpperCase()}${migrationClassName.slice(1)}`
              }
            },
            toTableName() {
              return function () {
                return string.snakeCase(tableName)
              }
            },
          },
        })

        continue
      }

      this.setArtifactTemplateData({
        artifactType,
        templateData: {},
      })
    }

    await this.generate()

    this.finishCmmaCommand()
  }
}
