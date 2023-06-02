import CmmaContext from '../Models/CmmaContext'
import CmmaSystem from '../Models/CmmaSystem'

export default class CmmaContextActions {
  /**
   * @description Add a System to the context
   * @author FATE
   * @param {} addSystemToContextOptions
   */
  public static addSystemToContext(addSystemToContextOptions: {
    systemLabel: string
    system: CmmaSystem
    contextMap: CmmaContext
  }) {
    const { systemLabel, system, contextMap } = addSystemToContextOptions

    Object.assign(contextMap.systems, {
      [systemLabel]: system,
    })
  }

  /**
   * @description Get a Context System By Index
   * @author FATE
   * @param {} getSystemByIndexOptions
   */
  public static getContextSystemByIndex(getSystemByIndexOptions: {
    systemIndex: number
    context: CmmaContext
  }) {
    const { systemIndex, context } = getSystemByIndexOptions

    const systems = Object.keys(context.systems)

    const systemLabel = systems[systemIndex]

    return context.systems[systemLabel]
  }

  /**
   * @description Get a Context System By Label
   * @author FATE
   * @param {} getContextSystemByLabel
   */
  public static getContextSystemMapByLabel(getContextSystemByLabel: {
    systemLabel: string
    contextMap: CmmaContext
  }) {
    const { systemLabel, contextMap } = getContextSystemByLabel

    return contextMap.systems[systemLabel]
  }

  /**
   * @description List Systems in Context
   * @author FATE
   * @param {CmmaContext} contextMap
   */
  public static listSystemsInContext(contextMap: CmmaContext) {
    return Object.keys(contextMap.systems)
  }

  /**
   * @description Delete a Context System By Index
   * @author FATE
   * @param {} getSystemByIndexOptions
   */
  public static deleteContextSystemByIndex(getSystemByIndexOptions: {
    systemIndex: number
    context: CmmaContext
  }) {
    const { systemIndex, context } = getSystemByIndexOptions

    const systems = Object.keys(context.systems)

    const systemLabel = systems[systemIndex]

    delete context.systems[systemLabel]
  }

  /**
   * @description Delete a Context System By Label
   * @author FATE
   * @param {} getContextSystemByLabel
   */
  public static deleteContextSystemByLabel(getContextSystemByLabel: {
    systemLabel: string
    contextMap: CmmaContext
  }) {
    const { systemLabel, contextMap } = getContextSystemByLabel

    delete contextMap.systems[systemLabel]
  }

  /**
   * @description Is System in Context
   * @author FATE
   * @param isSystemInContextOptions
   */
  public static isSystemInContext(isSystemInContextOptions: {
    systemLabel: string
    contextMap: CmmaContext
  }) {
    const { systemLabel, contextMap } = isSystemInContextOptions
    return this.listSystemsInContext(contextMap).includes(systemLabel)
  }

  /**
   * @description What is Contexts' View Filename
   * @author FATE
   * @param context
   */
  public static whatIsContextLabel(context: CmmaContext) {
    return context.contextLabel
  }

  /**
   * @description
   * @author FATE
   * @param
   */
  public static get blankContext(): CmmaContext {
    return {
      contextLabel: '',
      systems: {},
    }
  }
}
