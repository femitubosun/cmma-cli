import { join } from 'path'
import { args, flags } from '@adonisjs/core/build/standalone'
import { BaseGenerator } from '../../Base'

/**
 * Command to make a new event listener class
 */
export default class MakeListener extends BaseGenerator {
  /**
   * Command meta data
   */
  public static commandName = 'make:system-listener'
  public static description = 'Make a new event listener in a System'
  @args.string({ description: 'Name of the event listener class in a System' })
  public name: string

  @flags.string({
    description: 'Name of the System',
  })
  public system: string

  @flags.boolean({
    description: 'Create the listener with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean
  /**
   * Required by BaseGenerator
   */
  protected form = 'singular' as const
  protected pattern = 'pascalcase' as const
  protected resourceName: string
  protected createExact: boolean

  public async run() {
    this.resourceName = this.name
    this.createExact = this.exact

    if (!this.system) {
      this.logger.error(new Error('Missing required flag "system"'))
      return
    }

    const file = await super.generate()
    if (!file) {
      return
    }
    const fileJSON = file.toJSON()

    if (fileJSON.state === 'persisted') {
      this.ui
        .instructions()
        .heading('Register event')
        .add(`Open ${this.colors.cyan('start/events.ts')} file`)
        .add(
          `Register the following System Listeners directory as a namespace for every event like this`
        )
        .add(
          this.colors
            .cyan()
            .underline(
              `Event.on('', '${
                fileJSON.filename
              }.onNew${this.getListenerName()}').namespace('${this.getListenerNamespace()}')`
            )
        )
        .render()
    }
  }

  /**
   * Returns the template stub
   */
  protected getStub(): string {
    return join(__dirname, '..', 'templates', 'event-listener.txt')
  }

  /*
    Returns Listener path for the system
   */
  protected getDestinationPath(): string {
    return `${this.application.appRoot}/app/Systems/${this.system}/Listeners`
  }

  private getListenerNamespace() {
    let listenerNamespace: string = ''
    let splitName: string[]

    if (this.name.includes('/')) {
      splitName = this.name.split('/')
      splitName.pop()
      listenerNamespace = splitName.join('/')
    } else if (this.name.includes('\\')) {
      splitName = this.name.split('\\')
      splitName.pop()
      listenerNamespace = splitName.join('/')
    }
    return `App/Systems/${this.system}/Listeners/${listenerNamespace}`
  }

  private getListenerName(): string {
    let listenerName: string
    let splitName: string[]

    if (this.name.includes('/')) {
      splitName = this.name.split('/')
      listenerName = splitName[splitName.length - 1]
    } else if (this.name.includes('\\')) {
      splitName = this.name.split('\\')
      listenerName = splitName[splitName.length - 1]
    } else {
      listenerName = this.name
    }
    return listenerName
  }
}
