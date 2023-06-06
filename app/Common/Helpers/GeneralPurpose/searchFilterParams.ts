import { string } from '@ioc:Adonis/Core/Helpers'

/**
 * @description This function accept searchParam as parameter.
 * The function also sanitizes the search field to avoid SQL injection
 * @param {string} searchParam - The pagination query object
 * @returns {Object}
 */

const searchFilterParams = (searchParam: { search?: string; value?: any }) => {
  return {
    searchKey: string.condenseWhitespace(
      string.escapeHTML(searchParam.search ? searchParam.search : '')
    ),
    searchValue: searchParam.value ? searchParam.value : '',
  }
}

export default searchFilterParams
