import { BaseCmmaCommand } from '../../../cmma/BaseCommands/BaseCmmaCommand'
import CmmaConfiguration from '../../../cmma/Models/CmmaConfiguration'
import AppwriteSeedsRunner from '../../../cmma/Helpers/Seeder/AppwriteSeedsRunner'

export default class AppwriteSeed extends BaseCmmaCommand {
  public static commandName = 'cmma:appwrite-seed'
  public static description = 'Run Appwrite Seeds'
  public static settings = {
    loadApp: false,
    stayAlive: false,
  }

  protected PROJECT_CONFIG: CmmaConfiguration = this.projectConfigurationFromFile!
  protected commandShortCode = 'apw|seed'
  protected targetEntity: string = ''

  private getSeedRunner() {
    return new AppwriteSeedsRunner(this.PROJECT_CONFIG)
  }

  public async run() {
    await this.ensureConfigFileExistsCommandStep()

    const seedRunner = this.getSeedRunner()

    // await seedRunner.run()

    const seedsList = seedRunner.getSeedsList()
    this.logger.info('Seeding Appwrite Data')

    for (let seed of seedsList) {
      this.logger.success(`${seed}`)
    }
  }
}
