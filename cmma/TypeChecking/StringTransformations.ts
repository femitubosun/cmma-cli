import CmmaProjectCasePatternType from './CmmaProjectCasePatternType'

type StringTransformations = {
  form?: 'plural' | 'singular'
  pattern?: CmmaProjectCasePatternType
  extname?: string
  prefix?: string
  suffix?: string
}

export default StringTransformations
