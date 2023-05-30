import CmmaSystem from './CmmaSystem'

type CmmaContext = {
  systems: Record<string, CmmaSystem>
  ContextRoutesFileName: string
  ContextViewsFileName: string
}

export default CmmaContext
