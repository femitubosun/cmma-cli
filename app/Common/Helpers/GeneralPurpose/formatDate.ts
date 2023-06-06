import { DateTime } from 'luxon'
type DateOptionsType = {
  dateElement: DateTime
  dateFormat: string
}
/**
 * @description Change the date into friendly format
 * @author Agoro, Adegbenga. B
 * @param {DateOptionsType} dateOptions
 * @returns {*}  {string}
 */
function formatDate(dateOptions: DateOptionsType): string {
  const { dateElement, dateFormat } = dateOptions
  const dateISO = DateTime.fromISO(String(dateElement))

  return dateISO.toFormat(dateFormat)
}

export default formatDate
