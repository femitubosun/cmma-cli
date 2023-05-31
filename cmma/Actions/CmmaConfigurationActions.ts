import CmmaConfiguration from '../TypeChecking/CmmaConfiguration'
import CmmaProjectCasePatternType from '../TypeChecking/CmmaProjectCasePatternType'
import { string } from '@ioc:Adonis/Core/Helpers'
import TransformLabelOptions from '../TypeChecking/Config/TransformLabelOptions'
import StringTransformations from '../TypeChecking/StringTransformations'
import CmmaArtifactGroupLabel from '../TypeChecking/CmmaArtifactGroupLabel'
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
   * @description Resolve Artifact's Label
   * @author FATE
   * @param {} resolveArtifactLabelOptions
   */
  public static normalizeArtifactLabel(resolveArtifactLabelOptions: {
    artifactLabel: string
    artifactType: CmmaArtifactType
    configObject: CmmaConfiguration
    noExt?: boolean
  }) {
    const { artifactLabel, noExt, artifactType, configObject } = resolveArtifactLabelOptions

    const Resolve: Record<CmmaArtifactType, Function> = {
      index: () =>
        this.transformLabel({
          label: artifactLabel,
          transformations: {
            extname: '.ts',
            pattern: 'camelcase',
          },
          noExt,
        }),
      file: () =>
        this.transformLabel({
          label: artifactLabel,
          transformations: {
            extname: '.ts',
            pattern: configObject.defaultCasePattern,
          },
          noExt,
        }),
      view: () =>
        this.transformLabel({
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'views',
            configObject,
          }),
          noExt,
        }),
      model: () =>
        this.transformLabel({
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'models',
            configObject,
          }),
          noExt,
        }),
      migration: () =>
        this.transformLabel({
          label: artifactLabel,
          noExt,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'migrations',
            configObject,
          }),
        }),
      controller: () =>
        this.transformLabel({
          noExt,
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'controllers',
            configObject,
          }),
        }),
      action: () =>
        this.transformLabel({
          noExt,
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'actions',
            configObject,
          }),
        }),
      typechecking: () =>
        this.transformLabel({
          noExt,
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'typechecking',
            configObject,
          }),
        }),
      route: () =>
        this.transformLabel({
          noExt,
          label: artifactLabel,
          transformations: this.getArtifactGroupTransformation({
            artifactGroup: 'routes',
            configObject,
          }),
        }),
    }

    return Resolve[artifactType]()
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

  public static getArtifactGroupTransformation(getArtifactGroupTransformationOptions: {
    artifactGroup: CmmaArtifactGroupLabel
    configObject: CmmaConfiguration
  }): StringTransformations {
    const { artifactGroup, configObject } = getArtifactGroupTransformationOptions

    const transformations: Record<CmmaArtifactGroupLabel, StringTransformations> = {
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

      operations: {
        extname: '.ts',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      routes: {
        extname: '.ts',
        suffix: 'Routes',
        pattern: configObject.defaultCasePattern,
      },

      typechecking: {
        extname: '.ts',
        suffix: 'Options',
        form: 'singular',
        pattern: configObject.defaultCasePattern,
      },

      validators: {
        extname: '.ts',
        suffix: 'Validator',
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
        'controllers',
        'migrations',
        'models',
        'routes',
        'typechecking',
        'validators',
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
