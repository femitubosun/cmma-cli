import slugify from 'slugify'

/**
 * @description Takes a string of words and hyphenates it by converting
 * all the spaces and special characters to dashes (-)
 * @author Agoro, Adegbenga. B
 * @param {string} phrase The phrase to be hyphenated
 * @returns {string} The hyphenated version of the provided phrase
 *
 */
const hyphenateString = (phrase: string): string => {
  return slugify(phrase, {
    lower: true,
    strict: true,
  })
}

export default hyphenateString
