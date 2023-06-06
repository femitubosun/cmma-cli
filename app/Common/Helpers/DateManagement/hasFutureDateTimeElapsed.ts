import { DateTime } from 'luxon'
import DatesForComparisonType from 'App/Common/TypeChecking/DateManagement/DatesForComparisonType'

/**
 * @description Checks if the provided DateTime is behind the Current DateTime
 * @author Agoro, Adegbenga. B
 * @param {DatesForComparisonType} datesForComparison Object with the available options which are currentDateTime, futureDateTime.
 * currentDateTime defaults to the exact DateTime when the function was called
 * @returns {*}  {boolean}
 */
const hasFutureDateTimeElapsed = (datesForComparison: DatesForComparisonType): boolean => {
  const CURRENT_DATE_TIME_IS_AHEAD = true
  const CURRENT_DATE_TIME_IS_NOT_AHEAD = false

  const { currentDateTime = DateTime.now(), futureDateTime } = datesForComparison

  if (currentDateTime > futureDateTime) {
    return CURRENT_DATE_TIME_IS_AHEAD
  }

  return CURRENT_DATE_TIME_IS_NOT_AHEAD
}

export default hasFutureDateTimeElapsed
