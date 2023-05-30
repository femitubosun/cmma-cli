import CmmaModule from '../Models/CmmaModule'
import CmmaArtifact from '../Models/CmmaArtifact'

export default class CmmaModuleActions {
  /**
   * @description Add ModuleController to Module
   * @author FATE
   * @param {} addModuleControllerToModuleOptions
   */
  public static addModuleControllerToModule(addModuleControllerToModuleOptions: {
    controller: CmmaArtifact
    module: CmmaModule
  }) {
    const { controller, module } = addModuleControllerToModuleOptions

    module.controllers.push(controller)
  }

  /**
   * @description Add ModuleValidator to Module
   * @author FATE
   * @param {} addModuleValidatorToModuleOptions
   */
  public static addModuleValidatorToModule(addModuleValidatorToModuleOptions: {
    validator: CmmaArtifact
    module: CmmaModule
  }) {
    const { validator, module } = addModuleValidatorToModuleOptions

    module.validators.push(validator)
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
    return { controllers: [], validators: [] }
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
