/**
 * @description Takes a string of words and get its substring of length 255
 * @author FATE
 * @param {string} message The message to get its excerpt
 * @returns {string} The excerpt of the provided message
 *
 */
const stringExcerpt = (message: string): string => {
  const EXCERPT_BREAK_POINT = 120
  return message.length > EXCERPT_BREAK_POINT
    ? `${message.slice(0, EXCERPT_BREAK_POINT)}...`
    : message
}

export default stringExcerpt
