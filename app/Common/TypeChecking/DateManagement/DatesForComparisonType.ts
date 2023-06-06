import { DateTime } from 'luxon'

type DatesForComparisonType = {
  /**
   * This is the current DateTime when the function was called
   */
  currentDateTime?: DateTime

  /**
   * The future DateTime to be compared
   */
  futureDateTime: DateTime
}

export default DatesForComparisonType
