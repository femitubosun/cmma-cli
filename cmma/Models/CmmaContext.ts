import CmmaSystem from './CmmaSystem'

type CmmaContext = {
  systems: Record<string, CmmaSystem>
  contextLabel: string
}

export default CmmaContext
