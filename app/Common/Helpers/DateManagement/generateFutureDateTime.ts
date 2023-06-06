import { DateTime } from 'luxon'
import TimeOptionsInterface from 'App/Common/TypeChecking/DateManagement/TimeOptionsInterface'

/**
 * @description Generate a DateTime in the future depending on the provided options
 * @author Agoro, Adegbenga. B
 * @param {TimeOptionsInterface} dateTimeOptions Object with the available options which are currentDateTime, futureTimeDuration and timeComponent.
 * currentDateTime defaults to the exact DateTime when the function was called
 * timeComponent can be one of the following - days | hours | minutes | seconds | milliseconds. It defaults to minutes
 * @returns {*}  {DateTime} The futuristic DateTime Value
 */
function generateFutureDateTime(dateTimeOptions: TimeOptionsInterface): DateTime {
  const {
    currentDateTime = DateTime.now(),
    futureTimeDuration,
    timeComponent = 'minutes',
  } = dateTimeOptions

  if (timeComponent === 'days') {
    return currentDateTime.plus({ days: futureTimeDuration })
  }

  if (timeComponent === 'hours') {
    return currentDateTime.plus({ hours: futureTimeDuration })
  }

  if (timeComponent === 'seconds') {
    return currentDateTime.plus({ seconds: futureTimeDuration })
  }

  if (timeComponent === 'milliseconds') {
    return currentDateTime.plus(futureTimeDuration)
  }

  // Default output futureDateTime in minutes
  return currentDateTime.plus({ minutes: futureTimeDuration })
}

export default generateFutureDateTime
