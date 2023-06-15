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
    * [Configuration Commands](#configuration-commands)
    * [Initialization Commands](#initialization-commands)
    * [Make Artifact Commands](#make-artifact-commands)
    * [Make Abstract Artifacts](#make-abstract-artifacts)
    * [Migration Commands](#migration-commands)
    * [Seeder Commands](#seeder-commands)
    * [Command Short Codes](#command-short-codes)

<!-- TOC -->

## Description

This is a CLI based off AdonisJs' [ACE CLI tool](https://docs.adonisjs.com/guides/ace-commandline) and is optimized for
working in the same environment. The Architecture aims to break Software into distinct and almost isolated systems.
To facilitate communication between systems, an internal api is used.

## Installation

The CMMA CLI is aimed at working in an [AdonisJs](https://docs.adonisjs.com/guides/introduction) environment, and
it assumes an Adonis Project has been set up and Lucid has optionally been set up.

1. Copy the `cmma` folder into your project root. This contains the CLI's logic.
2. Copy the `CMMA` folder in the `commands` folder into your `commands` folder. This contains the CMMA commands
3. Run `node ace generate:manifest` to register the commands into the ACE CLI.

## Terminologies

| Term                | Meaning                                                                              | Example                              |
|---------------------|--------------------------------------------------------------------------------------|--------------------------------------|
| Context             | Typically, a type/group of consumer clients                                          | `PublicAPi`, `Admin`, `MobileClient` |
| System              | A System is a group of closely related artifacts                                     |                                      |
| Module              | A Module is a group of related operations that satisfy related user stories          |                                      |
| ConfigurationObject | The Object that defines the properties of a CMMA Project                             |                                      |
| ProjectMap          | A property of the Configuration Object that shows the structure of the Project       |                                      |
| Boundary            | A Context, System, or Module.                                                        |                                      |
| Artifact            | A Controller, Action, Model etc.                                                     |                                      |
| AbstractArtifact    | A Collection of two or more closely related Artifacts e.g A Controller & a Validator | `Operation`, `Model Options`         |
| ArtifactsGroup      | A group of Artifacts of the same type e.g Controllers Artifact Group                 |                                      |
| Node                | A Node is a point on the project map. Typically a Boundary, Artifact, ArtifactsGroup |                                      |                                      |
| Entity              | General Name for CMMA Identifiers                                                    |                                      |

## Cmma Configuration File

`cmma-config.json`

```json

{
  "defaultProjectRootDirInApp": "Systems",
  "defaultSystemInternalApiSuffix": "System",
  "defaultCasePattern": "pascalcase",
  "defaultSystemArtifactDirs": [
    "actions",
    "migrations",
    "models",
    "routes",
    "seeders",
    "typeChecking",
    "views"
  ],
  "defaultModuleDirIn": [
    "controllers",
    "validators"
  ],
  "logs": [
  ],
  "projectMap": {
    "Contexts": {},
    "Artifacts": []
  }
}
```

### `defaultProjectRootDirInApp`

This refers to the location in `./app/` Where the Project will live. With the above settings, CMMA will be generated in
`./app/Systems/`

### `defaultSystemInternalApiSuffix`

This refers to the default suffix for the System's Internal API file. With the above settings, the filename of the
internal API for a `Finance` system will be `FinanceSystem.ts`

### `defaultCasePattern`

This refers to the case pattern that would be used to generate files and directories. Note that art

### `defaultSystemArtifactDirs`

This refers to the folders that will be created in every System. With the above settings, a
`Finance` System would have `Actions`, `Migrations`...etc. folders when it is generated.

### `defaultModuleDir`

Modules are generated in Artifact directories. With the above settings, if a `Payments` Module is added to a `Finance`
System,
a `Payments` directory will be created in `Finance/Controllers` and `Finance/Validators`

### `logs`

CMMA CLI logs. Check [Command Short Codes](#command-short-codes) for reference.

### `projectMap`

This is a graph of the current System's structure

## CMMA Commands

> Note: Most CMMA Commands are interactive, and will ask you for Context, System and Modules depending on the situation.

### Configuration Commands

| Command              | ShortCode | Description                                                                                                                                                                                                                                                   |
|----------------------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cmma:config-create` | `cr`      | Create a CMMA Configuration File                                                                                                                                                                                                                              |
| `cmma:config-update` | `up`      | Synchronize the Files on Disk with the `ProjectMap`. Here, files on Disk is king. If for example an artifact doesn't exist on Disk, but it exists on the Project Map, the CLI will remove the artifact from the Project Map. This Process is called `Pruning` |

### Initialization Commands

| Command     | ShortCode | Description                                                                           |
|-------------|-----------|---------------------------------------------------------------------------------------|
| `cmma:init` | `in`      | Initialize the CMMA Project.  This requires you to have created a configuration file. |

### Make Artifact Commands

| Command                    | ShortCode   | Description                 |
|----------------------------|-------------|-----------------------------|
| `cmma:make-<entity>`       | `mk\|`      | Structure for make commands |
| `cmma:make-context`        | `mk\|con\|` | Make a Context              |                                 
| `cmma:make-system`         | `mk\|sys\|` | Make a System               |
| `cmma:make-module`         | `mk\|mod\|` | Make a Module               |
| `cmma:make-action`         | `mk\|act\|` | Make an Action              |
| `cmma:make-controller`     | `mk\|ctr\|` | Make a Controller           |
| `cmma:make-create-options` | `mk\|tyc\|` | Make a Model Create Options |
| `cmma:make-migration`      | `mk\|mig\|` | Make a Migration            |
| `cmma:make-model`          | `mk\|mdl\|` | Make a Model                |
| `cmma:make-seeder`         | `mk\|sed\|` | Make a Seeder               |
| `cmma:make-update-option`  | `mk\|tyu\|` | Make a Model Update Options |
| `cmma:make-validator`      | `mk\|val\|` | Make a Validator            |
| `cmma:make-view`           | `mk\|viw\|` | Make a View                 |

Typical flow of a Make Artifact command looks like this.

```shell
PS D:/fate-projects/cmma-cli> node ace cmma:make-action Wallet
> What Context does this Action belong to? ...  Press <ENTER> to select
> Client

```

```shell
PS D:/fate-projects/cmma-cli> node ace cmma:make-action Wallet
> What Context does this Action belong to? · Client
> What System does this  Action belong to? ...  Press <ENTER> to select
> UserManagement
  Finance

```

```shell
PS D:/fate-projects/cmma-cli> node ace cmma: make-action Wallet
> What Context does this Action belong to? · Client
> What System does this  Action belong to? · Finance
[info]  Creating WalletActions Artifact in Finance System in Client Context.
CREATE: app/Systems/Client/Finance/Actions/WalletActions.ts
[success]  mk|act|0|1|0. Happy Coding 🚀 -- FATE.

```

### Make Abstract Artifacts

| Command                   | ShortCode   | Description                                                                                                                           |
|---------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `cmma:make-operation`     | `mk\|op\|`  | Make Operation Abstract Artifact. An Operation is a Controller-Validator pair. Both artifact types live in a Module.                  |
| `cmma:make-model-options` | `mk\|mop\|` | Make Model Options Abstract Artifact. Model Options is a ModelInterface-CreateModelOptions-UpdateModelOptions-ModelIdentifier quintet |

#### `cmma:make-operation`

This Command takes the name of the Operation as an argument and will ask for Context, System and Module

#### `cmma:make-model-options`

This Command takes the name of the Model the ModelOptions belong to. The CLI will search for the Model in the Project
and will ask for confirmation

### Migration Commands

All the following command work exactly the same way default Lucid Commands work, the only difference is that they pick
up all Migrations & Seeders you have created in a CMMA Project while default Lucid Commands will only look in
the `database/` folder, hence they won't find CMMA Migrations and Seeders. This means you can use flags like `--seed`
when running a CMMA `cmma:migration-fresh`

| Command                   | Short Code | Description                                    |
|---------------------------|------------|------------------------------------------------|
| `cmma:migration-run`      | `mig       | run`                                           | Migrate database by running pending CMMA Project Migrations |
| `cmma:migration-fresh`    | `mig\|fre` | Drop all tables and re-migrate the database    |
| `cmma:migration:refresh`  | `mig\|rfr` | Rollback and migrate database                  |
| `cmma:migration:reset`    | `mig\|res` | Rollback all migrations in CMMA Project        |
| `cmma:migration:rollback` | `mig\|rol` | Rollback migrations to a specific batch number |
| `cmma:migration:status`   | `mig\|sta` | View CMMA Project migrations status            |

### Seeder Commands

| Command         | Short Code | Description                           |
|-----------------|------------|---------------------------------------|
| `cmma:db-seed ` | `mig\|run` | Execute CMMA Project Database seeders |

### Command Short Codes

Command Short codes follow this structure `commandShortCode|indexOfSelectedValue1|indexOfSelectedValue2` and so on


