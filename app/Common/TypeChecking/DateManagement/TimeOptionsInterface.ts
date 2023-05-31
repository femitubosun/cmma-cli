import { DateTime } from 'luxon'

/*
|--------------------------------------------------------------------------
| The Shape of the object passed into the generateFutureDateTime function
|--------------------------------------------------------------------------
*/
interface TimeOptionsInterface {
  /**
   * The Current DateTime value which serves as the base
   */
  currentDateTime?: DateTime

  /**
   * The Time Duration in the future
   */
  futureTimeDuration: number

  /**
   * Determines the time to be added to the date
   */
  timeComponent?: 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
}

export default TimeOptionsInterface
