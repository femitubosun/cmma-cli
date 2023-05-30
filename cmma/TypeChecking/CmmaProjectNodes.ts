import CmmaBoundaryNode from '../Models/CmmaBoundaryNode'
import CmmaArtifactNode from '../Models/CmmaArtifactNode'

type CmmaProjectNodes = {
  context: CmmaBoundaryNode | undefined
  system: CmmaBoundaryNode | undefined
  module: CmmaBoundaryNode | undefined
  systemArtifactsDir: CmmaBoundaryNode | undefined
  artifact: CmmaArtifactNode | undefined
}

export default CmmaProjectNodes
