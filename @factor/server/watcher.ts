import { getFactorDirectories } from "@factor/cli/extension-loader"
import { getPath } from "@factor/api/paths"
import chokidar from "chokidar"

export const watcher = (callback: Function): void => {
  const watchDirs = getFactorDirectories().map(_ => `${_}/**`)

  chokidar
    .watch([`${getPath("source")}/**`, ...watchDirs], {
      ignoreInitial: true,
      ignored: `**/+(node_modules|test)/**`
    })
    .on("all", async (event, path) => {
      callback({ event, path })
    })
}
