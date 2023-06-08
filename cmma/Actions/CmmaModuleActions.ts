import CmmaModule from '../Models/CmmaModule'
import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

export default class CmmaModuleActions {
  /**
   * @description Add ModuleController to Module
   * @author FATE
   * @param {} addModuleControllerToModuleOptions
   */
  public static addModuleControllerToModule(addModuleControllerToModuleOptions: {
    controller: CmmaArtifact
    moduleMap: CmmaModule
  }) {
    const { controller, moduleMap } = addModuleControllerToModuleOptions

    moduleMap.controllers.push(controller)
  }

  /**
   * @description Add ModuleValidator to Module
   * @author FATE
   * @param {} addModuleValidatorToModuleOptions
   */
  public static addModuleValidatorToModule(addModuleValidatorToModuleOptions: {
    validator: CmmaArtifact
    moduleMap: CmmaModule
  }) {
    const { validator, moduleMap } = addModuleValidatorToModuleOptions

    moduleMap.validators.push(validator)
  }

  /**
   * @description Add Artifact to Module
   * @author FATE
   * @param {} addArtifactToModuleOptions
   */
  public static addArtifactToModule(addArtifactToModuleOptions: {
    artifact: string
    artifactsDir: CmmaArtifactDirs
    moduleMap: CmmaModule
  }) {
    const { artifact, artifactsDir, moduleMap } = addArtifactToModuleOptions

    moduleMap[artifactsDir].push(artifact)
  }

  /**
   * @description Get Module Controllers
   * @author FATE
   * @param {CmmaModule} module
   */
  public static listModuleControllers(module: CmmaModule) {
    return module.controllers
  }

  /**
   * @description Get Module Validators
   * @author FATE
   * @param {CmmaModule} module
   */
  public static listModuleValidators(module: CmmaModule) {
    return module.validators
  }

  /**
   * @description
   * @author FATE
   * @param {} listModuleArtifactsByTypeOptions
   */
  public static listModuleArtifactsByDirLabel(listModuleArtifactsByTypeOptions: {
    moduleMap: CmmaModule
    artifactsDir: CmmaArtifactDirs
  }) {
    const { moduleMap, artifactsDir } = listModuleArtifactsByTypeOptions

    return moduleMap[artifactsDir]
  }

  /**
   * @description Check if controller is in module
   * @author FATE
   * @param {} isControllerInModuleOptions
   */
  public static isControllerInModule(isControllerInModuleOptions: {
    controllerLabel: string
    moduleMap: CmmaModule
  }) {
    const { controllerLabel, moduleMap } = isControllerInModuleOptions

    return this.listModuleControllers(moduleMap).includes(controllerLabel)
  }

  /**
   * @description Check if validator is in module
   * @author FATE
   * @param {} isValidatorInModuleOptions
   */
  public static isValidatorInModule(isValidatorInModuleOptions: {
    validatorLabel: string
    moduleMap: CmmaModule
  }) {
    const { validatorLabel, moduleMap } = isValidatorInModuleOptions

    return this.listModuleValidators(moduleMap).includes(validatorLabel)
  }

  /**
   * @description Check if a Module Artifact is in an Artifact Dir
   * @author FATE
   * @param {} isModuleArtifactInArtifactDirOptions
   */
  public static isModuleArtifactInArtifactDir(isModuleArtifactInArtifactDirOptions: {
    artifactLabel: CmmaArtifact
    artifactsDir: CmmaArtifactDirs
    moduleMap: CmmaModule
  }) {
    const { artifactsDir, artifactLabel, moduleMap } = isModuleArtifactInArtifactDirOptions

    return this.listModuleArtifactsByDirLabel({ artifactsDir, moduleMap }).includes(artifactLabel)
  }

  /**
   * @description Delete a Module Artifact from Artifact Dir
   * @author FATE
   * @param {} deleteModuleArtifactFromArtifactDirOptions
   */
  public static deleteModuleArtifactFromArtifactDir(deleteModuleArtifactFromArtifactDirOptions: {
    artifactLabel: CmmaArtifact
    artifactDir: CmmaArtifactDirs
    moduleMap: CmmaModule
  }) {
    const { artifactDir, artifactLabel, moduleMap } = deleteModuleArtifactFromArtifactDirOptions

    const artifactsInDir = this.listModuleArtifactsByDirLabel({
      moduleMap,
      artifactsDir: artifactDir,
    })

    const artifactIndex = artifactsInDir.indexOf(artifactLabel)

    artifactsInDir.splice(artifactIndex, 1)
  }

  /**
   * @description Method to get a blank CmmaModule Map
   * @author FATE
   * @returns {CmmaModule}
   */
  public static get blankModuleMap(): CmmaModule {
    return { controllers: [], validators: [], moduleLabel: '' }
  }

  /**
   * @description What is node path from Project Map
   * @author FATE
   * @param {} whatIsNodeMapFromMeOptions
   */
  public static whatIsNodePathFromMe(whatIsNodeMapFromMeOptions: {
    moduleLabel?: string
    artifactLabel?: string
  }) {
    const { moduleLabel, artifactLabel } = whatIsNodeMapFromMeOptions

    const nodeMap: Array<string> = []

    if (moduleLabel) {
      nodeMap.push(moduleLabel)
    }

    if (artifactLabel) {
      nodeMap.push(artifactLabel)
    }

    return nodeMap
  }
}
