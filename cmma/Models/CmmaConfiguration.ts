import CmmaProjectCasePatternType from '../TypeChecking/CmmaProjectCasePatternType'
import CmmaProjectMap from './CmmaProjectMap'
import CmmaDefaultSystemArtifactDirLabel from '../TypeChecking/CmmaDefaultSystemArtifactDirLabel'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'

type CmmaConfiguration = {
  defaultProjectRootDirInApp: string

  defaultSystemInternalApiSuffix: string

  defaultCasePattern: CmmaProjectCasePatternType

  defaultSystemArtifactDirs: Array<CmmaDefaultSystemArtifactDirLabel>

  defaultModuleDirIn: Array<CmmaArtifactDirs>

  logs: Array<string>

  projectMap: CmmaProjectMap
}

export default CmmaConfiguration
