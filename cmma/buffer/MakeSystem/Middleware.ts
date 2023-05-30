import { join } from 'path'
import { args, flags } from '@adonisjs/core/build/standalone'
import { BaseGenerator } from '../../Base'

/**
 * Command to make a new middleware
 */
export default class MakeSystemMiddleware extends BaseGenerator {
  /**
   * Command meta data
   */
  public static commandName = 'make:system-middleware'
  public static description = 'Make a new middleware in a System'

  @args.string({ description: 'Name of the middleware class in a System' })
  public name: string

  @flags.string({
    description: 'Name of the System',
  })
  public system: string

  @flags.boolean({
    description: 'Create the middleware with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean
  /**
   * Required by BaseGenerator
   */
  protected suffix = ''
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

    console.log(fileJSON.filename)

    if (fileJSON.state === 'persisted') {
      this.ui
        .instructions()
        .heading('Register middleware')
        .add(`Open ${this.colors.cyan('start/kernel.ts')} file`)
        .add(`Register the following function as a global or a named middleware`)
        .add(
          this.colors
            .cyan()
            .underline(`() => import('${this.getMiddlewareNamespace()}${fileJSON.filename}')`)
        )
        .render()
    }
  }

  /**
   * Returns the template stub path
   */
  protected getStub(): string {
    return join(__dirname, '..', 'templates', 'middleware.txt')
  }

  protected templateData(): any {
    const middlewareName = this.getMiddlewareName()
    return {
      middlewareName,
    }
  }

  /**
   * Middleware are always created inside `app/Middleware` directory.
   * We can look into configuring it later.
   */
  protected getDestinationPath(): string {
    return `${this.application.appRoot}/app/Systems/${this.system}/Middleware`
  }

  private getMiddlewareNamespace(): string {
    let middlewareNamespace: string = ''
    let splitName: string[]

    if (this.name.includes('/')) {
      splitName = this.name.split('/')
      splitName.pop()
      middlewareNamespace = splitName.join('/')
      middlewareNamespace += '/'
    } else if (this.name.includes('\\')) {
      splitName = this.name.split('\\')
      splitName.pop()
      middlewareNamespace = splitName.join('/')
      middlewareNamespace += '/'
    }

    return `App/Systems/${this.system}/Middleware/${middlewareNamespace}`
  }

  private getMiddlewareName(): string {
    let middlewareName: string
    let splitName: string[]

    if (this.name.includes('/')) {
      splitName = this.name.split('/')
      middlewareName = splitName[splitName.length - 1]
    } else if (this.name.includes('\\')) {
      splitName = this.name.split('\\')
      middlewareName = splitName[splitName.length - 1]
    } else {
      middlewareName = this.name
    }
    return middlewareName
  }
}
