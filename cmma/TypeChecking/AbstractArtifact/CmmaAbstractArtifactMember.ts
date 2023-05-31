import CmmaArtifactType from '../CmmaArtifactType'
import CmmaArtifactGroupLabel from '../CmmaArtifactGroupLabel'

/*
|--------------------------------------------------------------------------------
| Object that defines a member of an abstract artifact
|--------------------------------------------------------------------------------
|
*/
type CmmaAbstractArtifactMember = {
  artifactType: CmmaArtifactType
  artifactGroup: CmmaArtifactGroupLabel
}

export default CmmaAbstractArtifactMember
