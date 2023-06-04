import CmmaProjectCasePatternType from '../TypeChecking/CmmaProjectCasePatternType'
import CmmaProjectMap from './CmmaProjectMap'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

type CmmaConfiguration = {
  defaultProjectRootDirInApp: string

  defaultSystemInternalApiSuffix: string

  defaultCasePattern: CmmaProjectCasePatternType

  defaultSystemArtifactDirs: Array<CmmaArtifactDirs>

  defaultModuleDirIn: Array<CmmaArtifactDirs>

  logs: Array<string>

  projectMap: CmmaProjectMap
}

export default CmmaConfiguration
