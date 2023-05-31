import { DateTime } from 'luxon'
import { cuid } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, column, beforeCreate, scope } from '@ioc:Adonis/Lucid/Orm'
import queryFilterParams from 'App/Common/Helpers/GeneralPurpose/queryFilterParams'
import searchFilterParams from 'App/Common/Helpers/GeneralPurpose/searchFilterParams'
import QueryFilterParamsInterface from 'App/Common/TypeChecking/GeneralPurpose/QueryFilterParamsInterface'

export default class AbstractModel extends BaseModel {
  @column()
  public identifier: string

  @column.dateTime({
    autoCreate: true,
    serialize: (dateValue: DateTime | null) => {
      return dateValue ? dateValue.setZone('utc').toLocaleString(DateTime.DATETIME_FULL) : dateValue
    },
  })
  public createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (dateValue: DateTime | null) => {
      return dateValue ? dateValue.setZone('utc').toLocaleString(DateTime.DATETIME_FULL) : dateValue
    },
  })
  public updatedAt: DateTime

  @beforeCreate()
  public static async generateIdentifier(model: AbstractModel) {
    model.identifier = cuid()
  }

  /**
   * Functions to extend Model Query
   */

  /**
   *
   * @description Model extension to sort Records in ascending or descending order.
   * You can also handle pagination by passing the page.
   *
   * Usage: await YourModel.query().withScopes((scopes) => scopes.filterQuery(queryParams))
   * @static
   * @memberof AbstractModel
   * @param {object} queryParams.orderBy the column name (key) to be used to order the fetched records
   * @param {string} queryParams.orderBy the column name (key) to be used to order the fetched records
   * @param {"asc"|"desc"} queryParams.sortBy  The order direction: Ascending (asc)  or Descending (desc)
   * @param {number} queryParams.page the page number
   * @param {number} queryParams.perPage the number of records to fetch per page
   *
   */
  public static filterQuery = scope((query, queryParams: QueryFilterParamsInterface) => {
    const queryFilter = queryFilterParams(queryParams)
    if (queryFilter.orderBy) {
      query.orderBy(queryFilter.orderBy, queryFilter.sortBy)
    }
    if (queryFilter.page && queryFilter.page !== null) {
      query.paginate(queryFilter.page, queryFilter.perPage)
    }
  })

  public static textSearch = scope((query, searchParam) => {
    const searchFilter = searchFilterParams(searchParam)
    if (searchFilter.searchKey) {
      query.whereRaw(`${searchFilter.searchKey} LIKE '%${searchFilter.searchValue}%' `)
      // TODO Handle multiple search params
      // query.whereILike(searchFilter.searchKey, `'%${searchFilter.searchValue}%' `)
    }
  })
}
