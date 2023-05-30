import { BaseCmmaCommand } from './BaseCmmaCommand'
import CmmaContext from '../Models/CmmaContext'
import CmmaSystem from '../Models/CmmaSystem'
import CmmaModule from '../Models/CmmaModule'
import CmmaArtifactsGroup from '../Models/CmmaArtifactsGroup'
import CmmaArtifact from '../Models/CmmaArtifact'
import CmmaProjectMap from '../Models/CmmaProjectMap'


export abstract class BaseCmmaBoundaryCommand extends BaseCmmaCommand {
  protected abstract boundaryObject:
    | CmmaContext
    | CmmaSystem
    | CmmaModule
    | CmmaArtifactsGroup
    | CmmaArtifact
    | CmmaProjectMap
}

