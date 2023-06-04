export function FOUND_NUMBER_OF_ENTITY_ON_MAP_BUT_NOT_ON_DISK(foundNumberOfEntityXInEntityYOptions: {
  entityCount: number
  entityLabel: string
}) {
  const { entityLabel, entityCount } = foundNumberOfEntityXInEntityYOptions
  return `Found ${entityCount} ${entityLabel}${
    entityCount === 1 ? '' : 's'
  } on Project Map but not on Disk. 🗺️`
}

export function FOUND_NUMBER_OF_ENTITIES_ON_DISK_BUT_NOT_ON_MAP(foundNumberOfEntityXInEntityYOptions: {
  entityCount: number
  entityLabel: string
}) {
  const { entityLabel, entityCount } = foundNumberOfEntityXInEntityYOptions
  return `Found ${entityCount} ${entityLabel}${
    entityCount === 1 ? '' : 's'
  } on Disk but not on Project Map. 💿`
}

export function ENTITY_PRUNED_FROM_PROJECT_MAP(entityPrunedFromProjectMapOptions: {
  entityLabel: string
  entityCount: number
}) {
  const { entityLabel, entityCount } = entityPrunedFromProjectMapOptions
  return `${entityCount} ${entityLabel}${entityCount === 1 ? '' : 's'} pruned from Project Map. ✂️`
}

export function ENTITY_ADDED_TO_PROJECT_MAP(entityPrunedFromProjectMapOptions: {
  entityLabel: string
  entityCount: number
}) {
  const { entityLabel, entityCount } = entityPrunedFromProjectMapOptions
  return `${entityCount} ${entityLabel}${entityCount === 1 ? '' : 's'} added to Project Map. 🪧`
}
