# Crenet's Modular Monolith Architecture CLI (C.M.M.A)

## Table of Contents

<!-- TOC -->

* [Crenet's Modular Monolith Architecture CLI (C.M.M.A)](#crenets-modular-monolith-architecture-cli-cmma)
  * [Table of Contents](#table-of-contents)
  * [Description](#description)
  * [Installation](#installation)
  * [Terminologies](#terminologies)
  * [Cmma Configuration File](#cmma-configuration-file)
    * [`defaultProjectRootDirInApp`](#defaultprojectrootdirinapp)
    * [`defaultSystemInternalApiSuffix`](#defaultsysteminternalapisuffix)
    * [`defaultCasePattern`](#defaultcasepattern)
    * [`defaultSystemArtifactDirs`](#defaultsystemartifactdirs)
    * [`defaultModuleDir`](#defaultmoduledir)
    * [`logs`](#logs)
    * [`projectMap`](#projectmap)
  * [CMMA Commands](#cmma-commands)
    * [Command Short Codes](#command-short-codes)

<!-- TOC -->

## Description

This is a CLI based off AdonisJs' [ACE CLI tool](https://docs.adonisjs.com/guides/ace-commandline) and is optimized for
working in the same environment. The Architecture aims to break Software into distinct and almost isolated systems.
To facilitate communication between systems, an internal api is used.

## Installation

The CMMA CLI is aimed at working in and [AdonisJs](https://docs.adonisjs.com/guides/introduction) environment and
it assumes an Adonis Project has been set up and Lucid has optionally been set up.

1. Copy the `cmma` folder into your project root. This contains the CLI's logic.
2. Copy the `CMMA` folder in the `commands` folder into your `commands` folder. This contains the CMMA commands
3. Run `node ace generate:manifest` to register the commands into the ACE CLI.

## Terminologies

| Term                | Meaning                                     | Example                              |
|---------------------|---------------------------------------------|--------------------------------------|
| Context             | Typically, a type/group of consumer clients | `PublicAPi`, `Admin`, `MobileClient` |
| System              |                                             |                                      |
| Module              |                                             |                                      |
| Artifact            |                                             |                                      |
| ArtifactGroup       |                                             |                                      |
| ConfigurationObject |                                             |                                      |
| ProjectMap          |                                             |                                      |
| Boundary            |                                             |                                      |
| Node                |                                             |                                      |
| NodeMap             |                                             |                                      |
| Command             |                                             |                                      |
| Entity              | General Name for CMMA Identifiers           |                                      |

## Cmma Configuration File

`cmma-config.json`

```json

{
  "defaultProjectRootDirInApp": "Systems",
  "defaultSystemInternalApiSuffix": "System",
  "defaultCasePattern": "pascalcase",
  "defaultProjectRoutesFileName": "Project",
  "defaultSystemArtifactDirs": [
    "actions",
    "controllers",
    "migrations",
    "models",
    "routes",
    "typechecking",
    "views"
  ],
  "defaultModuleDirIn": [
    "controllers",
    "validators"
  ],
  "logs": [
    "in|"
  ],
  "projectMap": {
    "Contexts": {},
    "Artifacts": [
      "Project"
    ]
  }
}
```

### `defaultProjectRootDirInApp`

This refers to the location in `./app/` Where the Project will live. With the above settings, CMMA will be generate in
`./app/Systems/`

### `defaultSystemInternalApiSuffix`

This refers to the default suffix for the System's Internal API file. With the above settings, the filename of the
internal API for a `Finance` system will be `FinanceSystem.ts`

### `defaultCasePattern`

This refers to the case pattern that would be used to generate files and directories. Note that art

### `defaultSystemArtifactDirs`

This refers to the folders that will be created in every System. With the above settings, a
`Finance` System would have `Actions`, `Controllers`, `Migrations`...etc folders when it is generated.

### `defaultModuleDir`

Modules are generated in Artifact directories. With the above settings, if a `Payments` Module is added to a `Finance`
System,
a `Payments` directory will be created in `Finance/Controllers` and `Finance/Validators`

### `logs`

CMMA CLI logs. Check [Command Short Codes](#command-short-codes) for reference.

### `projectMap`

This is a graph of the current System's structure

## CMMA Commands

| Command                    | ShortCode   | Description                        |
|----------------------------|-------------|------------------------------------|
| `cmma:init`                | `in\|`      | Initialize Adonis Project for CMMA |
| `cmma:make-<entity>`       | `mk\|`      | Structure for make commands        |
| `cmma:make-context`        | `mk\|con\|` | Make a Context                     |                                    |
| `cmma:make-system`         | `mk\|sys\|` | Make a System                      |
| `cmma:make-module`         | `mk\|mod\|` | Make a Module                      |
| `cmma:make-model`          | `mk\|mdl\|` | Make a Model                       |
| `cmma:make-action`         | `mk\|act\|` | Make an Action                     |
| `cmma:make-controller`     | `mk\|ctr\|` | Make a Controller                  |
| `cmma:make-view`           | `mk\|viw\|` | Make a View                        |
| `cmma:make-validator`      | `mk\|val\|` | Make a Validator                   |
| `cmma:make-create-options` | `mk\|cop\|` | Make a Model Create Options        |
|                            |             |                                    |

### Command Short Codes


