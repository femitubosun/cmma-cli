import CmmaModule from './CmmaModule'
import CmmaArtifactsGroup from './CmmaArtifactsGroup'
import CmmaDefaultSystemArtifactDirLabel from '../TypeChecking/CmmaDefaultSystemArtifactDirLabel'

type CmmaSystem = {
  modules: Record<string, CmmaModule>
  systemArtifacts: Record<CmmaDefaultSystemArtifactDirLabel, CmmaArtifactsGroup>
}

export default CmmaSystem
