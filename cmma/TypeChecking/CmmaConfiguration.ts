import CmmaProjectCasePatternType from './CmmaProjectCasePatternType'
import CmmaProjectMap from '../Models/CmmaProjectMap'
import CmmaDefaultSystemArtifactDirLabel from './CmmaDefaultSystemArtifactDirLabel'

type CmmaConfiguration = {
  defaultProjectRootDirInApp: string

  defaultSystemInternalApiSuffix: string

  defaultCasePattern: CmmaProjectCasePatternType

  defaultSystemArtifactDirs: Array<CmmaDefaultSystemArtifactDirLabel>

  defaultModuleDirIn: Array<CmmaDefaultSystemArtifactDirLabel>

  logs: Array<string>

  projectMap: CmmaProjectMap
}

export default CmmaConfiguration
