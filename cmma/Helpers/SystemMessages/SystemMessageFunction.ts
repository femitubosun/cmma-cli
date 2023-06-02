export function FOUND_NUMBER_OF_ENTITY_X_IN_ENTITY_Y(foundNumberOfEntityXInEntityYOptions: {
  numberOfFoundEntities: number
  foundEntity: string
  sourceEntity: string
}) {
  const { numberOfFoundEntities, foundEntity, sourceEntity } = foundNumberOfEntityXInEntityYOptions
  return `Found ${numberOfFoundEntities} ${foundEntity}(s) in ${sourceEntity}`
}
