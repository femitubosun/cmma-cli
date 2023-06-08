import CmmaProjectCasePatternType from './CmmaProjectCasePatternType'

type CmmaStringTransformations = {
  form?: 'plural' | 'singular'
  pattern?: CmmaProjectCasePatternType
  extname?: string
  prefix?: string
  suffix?: string
}

export default CmmaStringTransformations
