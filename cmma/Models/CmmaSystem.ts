import CmmaModule from './CmmaModule'
import CmmaArtifactsGroup from './CmmaArtifactsGroup'
import CmmaSystemResource from './CmmaSystemResource'
import CmmaDefaultSystemArtifactDirLabel from '../TypeChecking/CmmaDefaultSystemArtifactDirLabel'

type CmmaSystem = {
  modules: Record<string, CmmaModule>
  systemArtifacts: Record<CmmaDefaultSystemArtifactDirLabel, CmmaArtifactsGroup>
  SystemResources: Record<string, CmmaSystemResource>
  SystemRoutesFilename: string
  SystemViewsFileName: string
}

export default CmmaSystem
