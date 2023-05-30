import CmmaContext from './CmmaContext'
import CmmaArtifactsGroup from './CmmaArtifactsGroup'

type CmmaProjectMap = {
  Contexts: Record<string, CmmaContext>

  Artifacts: CmmaArtifactsGroup
}

export default CmmaProjectMap
