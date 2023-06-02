export const CONFIGURATION_FILE_EXISTS = 'Configuration file (cmma-config.json) exists'
export const PROCEEDING_WILL_OVERWRITE_CONFIG_FILE_CONTINUE =
  'Proceeding will overwrite existing configuration file. Continue?'
export const EXITING = 'Exiting...'

export const INITIALIZING_ADONIS_PROJECT_FOR_CMMA =
  "Initializing Adonis Project for Crenet's Modular Monolith Architecture (C.M.M.A)"
export const NOT_CONFIRMED_EXITING = 'Not Confirmed. Exiting....'

/*
|--------------------------------------------------------------------------------
| Artifact Labels
|--------------------------------------------------------------------------------
|
*/
export const CONTROLLER = 'Controller'
export const SYSTEM = 'System'
export const MODULE = 'Module'
export const CONTEXT = 'Context'
export const ARTIFACT = 'Artifact'
export const OPERATION = 'Operation'
export const MODEL_OPTIONS = 'Model Options'
export const MODEL = 'Model'
export const ACTION = 'Action'

/*
|--------------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------------
|
*/
export const CREATE_CONFIG_COMMAND = 'node ace cmma:config-create'
export const INIT_PROJECT_COMMAND = 'node ace cmma:init'
export const MAKE_CONTEXT_COMMAND = `node ace cmma:make-context`
export const MAKE_SYSTEM_COMMAND = `node ace cmma:make-system`
export const MAKE_MODULE_COMMAND = `node ace cmma:make-module`

/*
|--------------------------------------------------------------------------------
| ERROR MESSAGES
|--------------------------------------------------------------------------------
|
*/
export const NO_DEFINED_CONTEXTS_IN_PROJECT = 'There are no defined Contexts in this Project'
export const NO_DEFINED_SYSTEMS_IN_CONTEXT = 'There are no defined Systems in this Context'
export const NO_DEFINED_MODULES_IN_SYSTEM = 'There are no defined modules in this System'
export const YOU_HAVE_ALREADY_REGISTERED_CONTEXT_IN_PROJECT =
  'You have already registered this Context in the Project'
export const YOU_HAVE_ALREADY_REGISTERED_SYSTEM_IN_CONTEXT =
  'You have already registered this System in the Context'
export const YOU_HAVE_ALREADY_REGISTERED_MODULE_IN_SYSTEM =
  'You have already registered this System in the Context'
export const YOU_HAVE_ALREADY_REGISTERED_ARTIFACT_IN_SYSTEM =
  'You have already registered this System in the Context'
export const YOU_HAVE_ALREADY_REGISTERED_CONTROLLER_IN_MODULE =
  'You have already registered this System in the Context'
export const YOU_HAVE_ALREADY_REGISTERED_VALIDATOR_IN_MODULE =
  'You have already registered this System in the Context'
export const MODULE_NOT_FOUND_IN_PROJECT = 'Module was not found in the Project'
export const ADD_NEW_CONTEXTS_TO_PROJECT_PROMPT = 'Add new Context(s) to Project?'
export const PRUNE_CONTEXT_PROMPT = 'Prune Context From Project Map?'
export const PRUNING = 'Pruning Project Map....'
