import randomstring from 'randomstring'
import RandomGeneratorOptionsInterface from 'App/Common/TypeChecking/GeneralPurpose/RandomGeneratorOptionsInterface'

/**
 *
 * @description Generates a random number or string
 * @author Agoro, Adegbenga. B
 * @param {object} randomGeneratorOptions The parameter options which are characterLength, isCapitalized and outputOption
 * @returns {string} The Randomly Generated Number or String
 *
 */
const numberStringGenerator = (randomGeneratorOptions: RandomGeneratorOptionsInterface): string => {
  const {
    characterLength,
    isCapitalized = false,
    outputOption = 'alphanumeric',
  } = randomGeneratorOptions

  if (outputOption === 'numeric') {
    return randomstring.generate({
      length: characterLength,
      charset: outputOption,
    })
  }

  return randomstring.generate({
    length: characterLength,
    charset: outputOption,
    capitalization: isCapitalized === true ? 'uppercase' : 'lowercase',
  })
}

export default numberStringGenerator
