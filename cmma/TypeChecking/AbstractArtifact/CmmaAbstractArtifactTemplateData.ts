import CmmaAbstractArtifactEnum from './CmmaAbstractArtifactEnum'

type CmmaAbstractArtifactTemplates = Record<
  CmmaAbstractArtifactEnum,
  Record<string, Record<string, unknown>>
>

export default CmmaAbstractArtifactTemplates
