interface QueryFilterParamsInterface {
  /**
   * The field column to be used to sort the database list
   */
  orderBy: 'id' | string

  /**
   * The order in which data will be sorted.in Ascending (asc) or Descending (desc) order. Default is asc
   */
  sortBy: 'asc' | 'desc'

  /**
   * The Page number of datalist used for pagination
   */
  page?: number | null

  /**
   * The number of data per page
   */
  perPage?: number

  /**
   * The custom filter Key
   */
  filterBy?: any //isActive, isDeleted, isPublished

  /**
   * The value of the custom filter Key
   */
  filterValue?: any
}

export default QueryFilterParamsInterface
