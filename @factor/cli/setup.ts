/* eslint-disable no-console */
import { getExtensions } from "@factor/cli/extension-loader"
import { getPath } from "@factor/api/paths"
import { highlight } from "cli-highlight"
import { log, sortPriority, deepMerge, applyFilters, addCallback } from "@factor/api"
import chalk from "chalk"
import envfile from "envfile"
import fs from "fs-extra"
import inquirer, { Answers } from "inquirer"
import json2yaml from "json2yaml"

const configFile = getPath("config-file-public")
const secretsFile = getPath("config-file-private")

const extensionNames = (type: string, format = "join"): string => {
  const extensions = getExtensions().filter(_ => _.extend == type)

  if (extensions && extensions.length > 0) {
    const names = extensions.map(_ => _.name)

    return format == "count" ? names.length.toString() : names.join(", ")
  } else return "none"
}

const existingSettings = (): { publicConfig: object; privateConfig: object } => {
  if (!fs.pathExistsSync(configFile)) {
    fs.writeJsonSync(configFile, { config: {} })
  }
  const publicConfig = require(configFile)

  fs.ensureFileSync(secretsFile)
  const privateConfig = envfile.parseFileSync(secretsFile)

  return { publicConfig, privateConfig }
}

export const runSetup = async (): Promise<void> => {
  let answers: Answers

  log.formatted({
    title: "Welcome to Factor Setup!",
    lines: [
      { title: "Theme", value: extensionNames("theme"), indent: true },
      {
        title: "Modules",
        value: extensionNames("plugin", "count"),
        indent: true
      }
    ]
  })

  let setups: SetupCliConfig[] = applyFilters(
    "cli-add-setup",
    [
      {
        name: "Exit Setup",
        value: "exit",
        callback: (): void => {
          // eslint-disable-next-line unicorn/no-process-exit
          process.exit()
        },
        priority: 1000
      }
    ],
    existingSettings()
  )

  setups = sortPriority(setups)

  // Escapes the endless loop
  const askAgain = true

  const ask = async (): Promise<void> => {
    answers = await inquirer.prompt({
      type: "list",
      name: `setupItem`,
      message: `What would you like to do?`,
      choices: setups
    })

    console.log()

    const setupRunner = setups.find((_: SetupCliConfig) => _.value == answers.setupItem)

    if (setupRunner) {
      await setupRunner.callback()
    }

    if (askAgain) await ask()
  }

  await ask()
}

addCallback({ key: "setup", hook: "cli-setup", callback: () => runSetup() })

addCallback({
  key: "setup",
  hook: "after-first-server-extend",
  callback: () => {
    const setupNeeded = applyFilters("setup-needed", [])

    if (setupNeeded.length > 0) {
      const lines = setupNeeded.map((_: { title: string }) => {
        return { title: _.title, value: "", indent: true }
      })
      if (process.env.FACTOR_COMMAND !== "setup") {
        lines.push({ title: "Run 'yarn factor setup'", value: "", indent: false })
      }

      log.formatted({ title: "Setup Needed", lines, color: "yellow" })
    }
  }
})

export interface SetupCliConfig {
  name: string;
  value: string;
  callback: () => {} | void;
  priority?: number;
}

export const prettyJson = (data: object): string => {
  return highlight(json2yaml.stringify(data, null, "  "))
}

const writeFiles = (file: string, values: object): void => {
  const { publicConfig, privateConfig } = existingSettings()

  if (file.includes("factor-config")) {
    const conf = deepMerge([publicConfig, values])
    fs.writeFileSync(configFile, JSON.stringify(conf, null, "  "))
  }

  if (file.includes("env")) {
    const sec = deepMerge([privateConfig, values])

    fs.writeFileSync(secretsFile, envfile.stringifySync(sec))
  }
}

export const writeConfig = async (file: string, values: object): Promise<void> => {
  if (!file || !values) {
    return
  }
  const answers = await inquirer.prompt({
    type: "confirm",
    name: `writeFiles`,
    message: `Write the following settings to the "${chalk.cyan(
      file
    )}" file? \n\n ${prettyJson(values)} \n`,
    default: true
  })

  console.log()
  if (answers.writeFiles) {
    writeFiles(file, values)
    log.success(`Wrote to ${file}...\n\n`)
  } else {
    log.log(`Writing skipped.`)
  }
  console.log()

  return
}
