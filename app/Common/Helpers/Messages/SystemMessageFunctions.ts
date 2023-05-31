export function RESOURCE_FETCHED_SUCCESSFULLY(resourceName = 'Resource') {
  return `Fetched ${resourceName} successfully`
}

export function RESOURCE_NOT_FOUND(resourceName = 'Resource') {
  return `${resourceName} Was not found`
}

export function RESOURCE_LIST_FETCHED_SUCCESSFULLY(resourceName = 'Resource') {
  return `Fetched ${resourceName} list successfully`
}

export function RESOURCE_LIST_FETCH_FAILED(resourceName) {
  return `Unable To Fetch ${resourceName} list`
}
