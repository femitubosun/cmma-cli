/**
 * @description Remove the leading Hashtag symbol on any string
 * @author Agoro, Adegbenga. B
 * @param {string} phrase
 * @returns {*}  {string}
 */
const removeLeadingHashtag = (phrase: string): string => {
  const HASHTAG_SYMBOL = '#'

  if (phrase[0] === HASHTAG_SYMBOL) {
    return phrase.slice(1)
  }

  return phrase
}

export default removeLeadingHashtag
