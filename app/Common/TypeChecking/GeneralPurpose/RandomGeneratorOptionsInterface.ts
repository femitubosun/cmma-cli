/*
|--------------------------------------------------------------------------
| The Shape of the object passed into the numberStringGenerator function
|--------------------------------------------------------------------------
*/
interface RandomGeneratorOptionsInterface {
  /**
   * The length of the random string to be generated
   */
  characterLength: number

  /**
   * Defines the character set of the string to be generated.
   * Options are numeric or Alphanumeric(Default)
   */
  outputOption?: 'numeric' | 'alphanumeric'

  /**
   * Defines whether the output should be capitalized or not
   */
  isCapitalized?: boolean
}

export default RandomGeneratorOptionsInterface
