import CmmaConfiguration from '../Models/CmmaConfiguration'
import CmmaProjectCasePatternType from '../TypeChecking/CmmaProjectCasePatternType'
import { string } from '@ioc:Adonis/Core/Helpers'
import TransformLabelOptions from '../TypeChecking/Config/TransformLabelOptions'
import StringTransformations from '../TypeChecking/StringTransformations'
import CmmaArtifactDirs from '../TypeChecking/CmmaArtifactDirs'
import CmmaArtifactType from '../TypeChecking/CmmaArtifactType'

export default class CmmaConfigurationActions {
  /**
   * @description Resolve Project Identifier
   * @author FATE
   * @param {} resolveIdentifierOptions
   */
  public static resolveIdentifierToCasePattern(resolveIdentifierOptions: {
    identifier: string
    casePattern: CmmaProjectCasePatternType
  }) {
    const { identifier, casePattern } = resolveIdentifierOptions

    const Resolve: Record<CmmaProjectCasePatternType, (value: string) => string> = {
      pascalcase: string.pascalCase,

      camelcase: string.camelCase,

      snakecase: string.snakeCase,

      dashcase: string.dashCase,
    }

    return Resolve[casePattern](identifier)
  }

  /**
   * @description Transform an Artifact Label with Suffix, Prefix, Extension and Pattern
   * @author FATE
   * @param {TransformLabelOptions} transformLabelOptions
   */
  public static transformLabel(transformLabelOptions: TransformLabelOptions): string {
    const { label, transformations, noExt } = transformLabelOptions

    const { form, extname, pattern, suffix, prefix } = transformations

    let outputString = label

    if (form) {
      outputString =
        form === 'singular' ? string.singularize(outputString) : string.pluralize(outputString)
    }

    if (prefix) {
      outputString = prefix + '_' + outputString
    }

    if (suffix) {
      outputString = outputString + '_' + suffix
    }

    if (pattern) {
      outputString =
        label === 'index'
          ? outputString
          : this.identifierNormalizer({
              identifier: outputString,
              pattern,
            })
    }

    if (extname) {
      outputString = noExt ? outputString : outputString + extname
    }

    return outputString
  }

  /**
   * @description Get the string transformations for an artifact type
   * @param getArtifactGroupTransformationOptions
   * @author FATE
   * @returns StringTransformations
   */
  public static getArtifactTypeTransformationWithExtension(getArtifactGroupTransformationOptions: {
    artifactType: CmmaArtifactType
    configObject: CmmaConfiguration
  }): StringTransformations {
    const { artifactType, configObject } = getArtifactGroupTransformationOptions

    const transformations: Record<CmmaArtifactType, StringTransformations> = {
      'index': {
        extname: '.ts',
        pattern: 'snakecase',
      },

      'action': {
        extname: '.ts',
        suffix: 'Actions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'controller': {
        extname: '.ts',
        suffix: 'Controller',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'file': {
        extname: '.ts',
        pattern: configObject.defaultCasePattern,
      },

      'migration': {
        extname: '.ts',
        pattern: 'snakecase',
      },

      'model': {
        extname: '.ts',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'route': {
        extname: '.ts',
        suffix: 'Routes',
        pattern: configObject.defaultCasePattern,
      },

      'create-typechecking': {
        extname: '.ts',
        prefix: 'Create',
        suffix: 'RecordOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'update-typechecking': {
        extname: '.ts',
        prefix: 'Update',
        suffix: 'RecordOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'model-interface': {
        extname: '.ts',
        suffix: 'Interface',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'identifier-options': {
        extname: '.ts',
        suffix: 'IdentifierOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'validator': {
        extname: '.ts',
        suffix: 'RequestValidator',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'view': {
        extname: '.edge',
        pattern: 'dashcase',
      },
    }

    return transformations[artifactType]
  }

  /**
   * @description Get the string transformations for an artifact type without an extension
   * @param getArtifactGroupTransformationOptions
   * @author FATE
   * @returns StringTransformations
   */
  public static getArtifactTypeTransformationWithoutExtension(getArtifactGroupTransformationOptions: {
    artifactType: CmmaArtifactType
    configObject: CmmaConfiguration
  }): StringTransformations {
    const { artifactType, configObject } = getArtifactGroupTransformationOptions

    const transformations: Record<CmmaArtifactType, StringTransformations> = {
      'index': {
        pattern: 'snakecase',
      },

      'action': {
        suffix: 'Actions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'controller': {
        suffix: 'Controller',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'file': {
        pattern: configObject.defaultCasePattern,
      },

      'migration': {
        pattern: 'snakecase',
      },

      'model': {
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'route': {
        suffix: 'Routes',
        pattern: configObject.defaultCasePattern,
      },

      'create-typechecking': {
        prefix: 'Create',
        suffix: 'RecordOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'update-typechecking': {
        prefix: 'Update',
        suffix: 'RecordOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'model-interface': {
        suffix: 'Interface',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'identifier-options': {
        suffix: 'IdentifierOptions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'validator': {
        suffix: 'RequestValidator',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      'view': {
        pattern: 'dashcase',
      },
    }

    return transformations[artifactType]
  }

  /**
   * @description Get an Artifact's Default Directory
   * @author FATE
   * @param {} artifactType
   */
  public static getDefaultArtifactTypeDir(artifactType: CmmaArtifactType) {
    // NOTE: Default Dir for file & index are set to action for no reason at all.
    const defaultDir: Record<CmmaArtifactType, CmmaArtifactDirs> = {
      'create-typechecking': 'typeChecking',
      'identifier-options': 'typeChecking',
      'model-interface': 'typeChecking',
      'update-typechecking': 'typeChecking',
      'action': 'actions',
      'controller': 'controllers',
      'file': 'actions',
      'index': 'actions',
      'migration': 'migrations',
      'model': 'models',
      'route': 'routes',
      'validator': 'validators',
      'view': 'views',
    }

    return defaultDir[artifactType]
  }

  /**
   * @description Get the string transformations for an artifact group
   * @param getArtifactGroupTransformationOptions
   * @author FATE
   * @returns StringTransformations
   */
  public static getArtifactGroupTransformation(getArtifactGroupTransformationOptions: {
    artifactGroup: CmmaArtifactDirs
    configObject: CmmaConfiguration
  }): StringTransformations {
    const { artifactGroup, configObject } = getArtifactGroupTransformationOptions

    const transformations: Record<CmmaArtifactDirs, StringTransformations> = {
      actions: {
        extname: '.ts',
        suffix: 'Actions',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      controllers: {
        extname: '.ts',
        suffix: 'Controller',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      file: {
        extname: '.ts',
        pattern: configObject.defaultCasePattern,
      },

      migrations: {
        extname: '.ts',
        pattern: 'snakecase',
      },

      models: {
        extname: '.ts',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      routes: {
        extname: '.ts',
        suffix: 'Routes',
        pattern: configObject.defaultCasePattern,
      },

      typeChecking: {
        extname: '.ts',
        pattern: configObject.defaultCasePattern,
      },

      validators: {
        extname: '.ts',
        suffix: 'RequestValidator',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      views: {
        extname: '.edge',
        pattern: 'dashcase',
      },
    }

    return transformations[artifactGroup]
  }

  /**
   * @description Make an Identifier Consistent with CMMA Project Case Pattern
   * @param normalizeProjectIdentifierOptions
   * @author FATE
   */
  public static normalizeProjectIdentifier(normalizeProjectIdentifierOptions: {
    identifier: string
    configObject: CmmaConfiguration
  }) {
    const { identifier, configObject } = normalizeProjectIdentifierOptions

    return this.identifierNormalizer({
      identifier,
      pattern: configObject.defaultCasePattern,
    })
  }

  /**
   * @description Normalize any identifier by case pattern
   * @author FATE
   * @param {} identifierNormalizerOptions
   */
  public static identifierNormalizer(identifierNormalizerOptions: {
    identifier: string
    pattern: CmmaProjectCasePatternType
  }) {
    const { identifier, pattern } = identifierNormalizerOptions

    const Normalize: Record<CmmaProjectCasePatternType, (value: string) => string> = {
      pascalcase: string.pascalCase,

      camelcase: string.camelCase,

      snakecase: string.snakeCase,

      dashcase: string.dashCase,
    }

    return Normalize[pattern](identifier)
  }

  /**
   * @description List Default System Artifact Directories
   * @author FATE
   * @param configObject
   */
  public static whatIsDefaultSystemArtifactDirs(configObject: CmmaConfiguration) {
    return configObject.defaultSystemArtifactDirs
  }

  /**
   * @description Get Default Project Location in /app
   * @author FATE
   * @param configObject
   */
  public static whatIsDefaultProjectRootInApp(configObject: CmmaConfiguration) {
    return configObject.defaultProjectRootDirInApp
  }

  /**
   * @description What is the default System Suffix
   * @author FATE
   * @param configObject
   */
  public static whatIsDefaultSystemSuffix(configObject: CmmaConfiguration) {
    return configObject.defaultSystemInternalApiSuffix
  }

  /**
   * @description What is the default Case Pattern
   * @author FATE
   * @param configObject
   */
  public static whatIsDefaultCasePattern(configObject: CmmaConfiguration) {
    return configObject.defaultCasePattern
  }

  /**
   * @description
   * @author FATE
   * @param configObject
   */
  public static whatIsDefaultCreateModuleDirIn(configObject: CmmaConfiguration) {
    return configObject.defaultModuleDirIn
  }

  public static get blankCmmaConfiguration(): CmmaConfiguration {
    return {
      defaultProjectRootDirInApp: '',
      defaultSystemInternalApiSuffix: '',
      defaultCasePattern: 'pascalcase',
      defaultSystemArtifactDirs: [],
      defaultModuleDirIn: [],
      logs: [],
      projectMap: {
        contexts: {},
        artifacts: [],
      },
    }
  }

  public static get defaultCmmaConfiguration(): CmmaConfiguration {
    return {
      defaultProjectRootDirInApp: 'Systems',
      defaultSystemInternalApiSuffix: 'System',
      defaultCasePattern: 'pascalcase',
      defaultSystemArtifactDirs: [
        'actions',
        'migrations',
        'models',
        'routes',
        'typeChecking',
        'views',
      ],
      defaultModuleDirIn: ['controllers', 'validators'],
      logs: [],
      projectMap: {
        contexts: {},
        artifacts: [],
      },
    }
  }
}
