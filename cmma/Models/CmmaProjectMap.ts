import CmmaContext from './CmmaContext'
import CmmaArtifactsGroup from './CmmaArtifactsGroup'

type CmmaProjectMap = {
  contexts: Record<string, CmmaContext>

  artifacts: CmmaArtifactsGroup
}

export default CmmaProjectMap
