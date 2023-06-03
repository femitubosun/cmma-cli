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
    artifactDirLabel: CmmaArtifactDirs
    moduleMap: CmmaModule
  }) {
    const { artifact, artifactDirLabel, moduleMap } = addArtifactToModuleOptions

    moduleMap[artifactDirLabel].push(artifact)
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
