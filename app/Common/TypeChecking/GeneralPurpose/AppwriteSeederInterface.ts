export default interface AppwriteSeederInterface {
  MODEL_ACTION: unknown
  run(): Promise<void>
}
