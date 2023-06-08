import CmmaAbstractArtifactEnum from './CmmaAbstractArtifactEnum'
import CmmaStringTransformations from '../CmmaStringTransformations'

type CmmaAbstractArtifactTransformations = Record<
  CmmaAbstractArtifactEnum,
  Record<string, CmmaStringTransformations>
>

export default CmmaAbstractArtifactTransformations
