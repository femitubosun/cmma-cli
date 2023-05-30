import CmmaProjectMap from './CmmaProjectMap'
import CmmaProjectCasePatternType from '../TypeChecking/CmmaProjectCasePatternType'

type Configuration = {
  defaultContextRootDirInApp: string

  defaultSystemInternalApiSuffix: string

  moduleDirIn: string[]

  defaultProjectRoutesFileName: string

  defaultCasePattern: CmmaProjectCasePatternType

  defaultSystemArtifactDirs: string[]

  projectMap: CmmaProjectMap
}

export default Configuration
