import CmmaModule from './CmmaModule'
import CmmaArtifactsGroup from './CmmaArtifactsGroup'

type CmmaSystem = {
  modules: Record<string, CmmaModule>
  systemArtifacts: Record<string, CmmaArtifactsGroup>
  systemLabel: string
}

export default CmmaSystem
