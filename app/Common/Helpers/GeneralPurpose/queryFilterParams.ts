/**
 * @description This function accept queryParams as params and assigned a default value to any of the queryParams field the is not passed.
 * @param {string} queryParams - The pagination query object
 * @returns {QueryFilterParamsInterface}
 */
import QueryFilterParamsInterface from 'App/Common/TypeChecking/GeneralPurpose/QueryFilterParamsInterface'
import { NULL_OBJECT } from 'App/Common/Helpers/Messages/SystemMessages'

const queryFilterParams = (
  queryParams?: QueryFilterParamsInterface
): QueryFilterParamsInterface => {
  return {
    page: queryParams?.page ? Number(queryParams.page) : 1,
    perPage: queryParams?.perPage ? Number(queryParams.perPage) : undefined,
    orderBy: queryParams?.orderBy ? queryParams.orderBy : 'id',
    sortBy: queryParams?.sortBy ? queryParams.sortBy : 'asc',
    filterBy: queryParams?.filterBy ? queryParams.filterBy : NULL_OBJECT,
    filterValue: queryParams?.filterValue ? queryParams.filterValue : true,
  }
}

export default queryFilterParams
