import "@factor/build/webpack-overrides"
import { resolve } from "path"
import { applyFilters, log, ensureTrailingSlash, deepMerge } from "@factor/api"
import { getPath } from "@factor/api/paths"
import { getWorkingDirectory } from "@factor/api/utils"
import BundleAnalyzer from "webpack-bundle-analyzer"
import CopyPlugin from "copy-webpack-plugin"
import merge from "webpack-merge"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import nodeExternals from "webpack-node-externals"
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import VueLoaderPlugin from "vue-loader/lib/plugin"
import VueSSRClientPlugin from "vue-server-renderer/client-plugin"
import VueSSRServerPlugin from "vue-server-renderer/server-plugin"
import webpack, { Configuration, Stats, Compiler, Plugin } from "webpack"
import chalk from "chalk"
import { configSettings } from "@factor/api/config"
import { generateLoaders } from "@factor/cli/extension-loader"
import webpackProgressPlugin from "webpack/lib/ProgressPlugin"
import cliProgress, { SingleBar, MultiBar } from "cli-progress"
import { ControlFile } from "@factor/cli/types"
import { cssLoaders } from "./webpack-utils"

/**
 * Options to control the way a specific app builds
 */
interface FactorBundleOptions {
  cwd?: string;
  config?: Record<string, any>;
  controlFiles?: ControlFile[];
  webpackControls?: FactorWebpackControls;
  beforeBuild?: (_arguments: any) => void;
  beforeCompile?: (_arguments: any) => void;
  afterCompile?: (_arguments: any) => void;
}

interface BuildConfig {
  cwd: string;
  controlFiles?: ControlFile[];
  config?: Configuration;
  beforeBuild?: (_arguments: any) => void;
}

type FactorWebpackOptions = FactorWebpackControls & {
  target: string;
}

interface FactorWebpackControls {
  analyze?: boolean;
  testing?: boolean;
  clean?: boolean;
  cwd?: string;
}

export const getDefinedValues = (_arguments: FactorWebpackOptions): object => {
  const { target, cwd } = _arguments
  return applyFilters(
    "webpack-define",
    {
      "process.env.FACTOR_BUILD_ENV": JSON.stringify(target),
      "process.env.VUE_ENV": JSON.stringify(target),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.FACTOR_ENV": JSON.stringify(process.env.FACTOR_ENV),
      "process.env.FACTOR_APP_CONFIG": JSON.stringify(configSettings(cwd))
    },
    _arguments
  )
}

const base = async (_arguments: FactorWebpackOptions): Promise<Configuration> => {
  const { target, cwd } = _arguments
  const plugins = [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin(getDefinedValues(_arguments)),
    function(this: Compiler): void {
      this.plugin("done", function(stats: Stats) {
        const { errors } = stats.compilation
        if (errors && errors.length > 0) {
          errors.forEach(e => {
            log.error(e)
          })
        }
      })
    }
  ]

  const copyPluginConfig = applyFilters("webpack-copy-files-config", [], _arguments)
  if (copyPluginConfig.length > 0) {
    plugins.push(new CopyPlugin(copyPluginConfig))
  }

  const out = {
    output: {
      path: getPath("dist", cwd),
      filename: "js/[name].[hash:5].js"
    },
    resolve: {
      extensions: [".js", ".vue", ".json", ".ts"],
      alias: applyFilters("webpack-aliases", {}, _arguments)
    },
    module: {
      rules: applyFilters(
        "webpack-loaders",
        [
          { test: /\.vue$/, loader: "vue-loader" },
          {
            test: /\.(png|jpg|gif|svg|mov|mp4)$/,
            loader: "file-loader",
            // esModule option introduced in v5, but breaks markdown-image-loader
            options: { name: "[name]-[hash:5].[ext]", esModule: false }
          },
          { test: /\.css/, use: cssLoaders({ target, lang: "css", cwd }) },
          { test: /\.less/, use: cssLoaders({ target, lang: "less", cwd }) },
          { test: /\.md$/, use: [{ loader: "markdown-image-loader" }] },
          {
            test: /\.ts$/,
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [/\.vue$/],
              compilerOptions: {
                module: "es6",
                noEmit: false,
                strict: false,
                sourceMap: false
              },
              configFile: resolve(__dirname, "tsconfig.webpack.json")
            }
          }
        ],
        _arguments
      ),
      // https://github.com/webpack/webpack/issues/198#issuecomment-37306725
      // Undocumented webpack options to disable warnings on variables in node requires that have nothing to do with webpack

      unknownContextCritical: false
    },
    plugins,
    stats: { children: false },
    optimization: {
      sideEffects: true,
      usedExports: true
    }
  }

  // Allow for ignoring of files that should not be packaged for client
  const ignoreMods = applyFilters("webpack-ignore-modules", [], _arguments)

  if (ignoreMods.length > 0) {
    out.plugins.push(new webpack.IgnorePlugin(new RegExp(`^(${ignoreMods.join("|")})$`)))
  }

  return out
}

/**
 * Development build specific config
 * @param cwd - working directory
 */
const development = (cwd?: string): Configuration => {
  // Apparently webpack expects a trailing slash on these
  const publicPath = ensureTrailingSlash(getPath("dist", cwd))
  return {
    mode: "development",
    output: { publicPath },
    performance: { hints: false } // Warns about large dev file sizes,
  }
}
/**
 * Production build specific config
 */
const production = (): Configuration => {
  return {
    mode: "production",
    output: { publicPath: "/" },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/[name]-[hash:5].css",
        chunkFilename: "css/[name]-[hash:5].css"
      })
    ],
    performance: { hints: "warning" },
    optimization: {
      minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})]
    }
  }
}
/**
 * Specific config for the client/browser environment
 */
const client = (cwd?: string): Configuration => {
  const entry = getPath("entry-browser", cwd)
  const filename = "factor-client.json"
  return {
    entry,
    plugins: [new VueSSRClientPlugin({ filename })]
  }
}
/**
 * Specific config for the Node server environment
 */
const server = (cwd?: string): Configuration => {
  const entry = getPath("entry-server", cwd)

  const filename = "factor-server.json"
  return {
    target: "node",
    entry,
    output: { filename: "server-bundle.js", libraryTarget: "commonjs2" },

    // https://webpack.js.org/configuration/externals/#externals
    // https://github.com/liady/webpack-node-externals
    // do not externalize CSS files in case we need to import it from a dep
    externals: [nodeExternals({ whitelist: [/\.css$/, /factor/] })],
    plugins: [new VueSSRServerPlugin({ filename })]
  }
}

export const getWebpackConfig = async (
  _arguments: FactorWebpackOptions
): Promise<Configuration> => {
  const { target = "server", analyze = false, testing = false, cwd } = _arguments

  const baseConfig = await base(_arguments)

  const buildConfig =
    process.env.NODE_ENV == "production" ? production() : development(cwd)

  const targetConfig = target == "server" ? server(cwd) : client(cwd)

  const testingConfig: Configuration =
    testing || process.env.FACTOR_DEBUG ? { devtool: "source-map" } : {}

  const plugins: Plugin[] = applyFilters("webpack-plugins", [], _arguments)

  // Only run this once (server build)
  // If it runs twice it cleans it after the first
  if (analyze && target == "client") {
    plugins.push(new BundleAnalyzer.BundleAnalyzerPlugin({ generateStatsFile: true }))
  }

  const packageConfig = applyFilters("package-webpack-config", {})

  const config = merge(
    baseConfig,
    buildConfig,
    targetConfig,
    packageConfig,
    testingConfig,
    { plugins }
  )

  return config
}

/**
 * Generates production application bundles
 * @param options - bundling options and before, during, after callbacks
 */
export const generateBundles = async (
  options: FactorBundleOptions = {}
): Promise<void> => {
  const { cwd, webpackControls = {}, controlFiles, beforeBuild } = options

  generateLoaders({ cwd, controlFiles, clean: true })

  if (beforeBuild) {
    beforeBuild(options)
  }

  await Promise.all(
    ["server", "client"].map(async target => {
      const config = await getWebpackConfig({ ...options, ...webpackControls, target })

      const additionalConfig = options.config || {}

      const compiler = webpack(deepMerge([config, additionalConfig]))

      if (options.beforeCompile) options.beforeCompile({ compiler, config, target })

      await new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error || stats.hasErrors()) reject(error)
          else {
            if (options.afterCompile) {
              options.afterCompile({ compiler, error, stats, config, target })
            }

            resolve(true)
          }
        })
      })

      return
    })
  )
}

/**
 * Builds production application bundles and files based on an array of working directories.
 * @param _arguments - Options for controlling the production build
 */
export const buildProduction = async (
  _arguments: FactorWebpackControls = {}
): Promise<void> => {
  const buildDirectories: BuildConfig[] = applyFilters("build-directories", [
    { cwd: getWorkingDirectory() }
  ])

  const { Presets } = cliProgress

  const format = `${chalk.cyan("{percentage}%")} {msg} ${chalk.dim(`{target} {name}`)}`
  const multi: MultiBar = new cliProgress.MultiBar(
    {
      clearOnComplete: true,
      hideCursor: true,
      format
    },
    Presets.rect
  )

  const bars: Record<string, SingleBar> = {}
  const results: { info: string; target: string; cwd: string }[] = []
  const promises = buildDirectories.map(
    async ({ cwd, controlFiles, config, beforeBuild }: BuildConfig): Promise<void> => {
      const { name } = require(resolve(cwd, "package.json"))

      await generateBundles({
        cwd,
        webpackControls: _arguments,
        config,
        controlFiles,
        beforeBuild,
        beforeCompile({ compiler, target }) {
          const newBar: SingleBar | undefined = multi.create(100, 0, {
            msg: "",
            target,
            name
          })

          bars[name + target] = newBar

          compiler.apply(
            new webpackProgressPlugin((ratio: number, msg: string) => {
              if (bars[name + target]) {
                return bars[name + target].update(ratio * 100, { msg })
              } else return
            })
          )
        },
        afterCompile({ stats, target }) {
          if (bars[name + target]) {
            bars[name + target].stop()
            multi.remove(bars[name + target])
          }

          results.push({
            cwd,
            target,
            info: stats.toString({
              colors: true,
              modules: false,
              children: false,
              chunks: false,
              chunkModules: false
            })
          })
        }
      })

      return
    }
  )

  await Promise.all(promises)

  if (process.env.FACTOR_ENV != "test") {
    process.stdout.write(
      results
        .map(
          ({ target, info, cwd }) =>
            `\n\n\n\nBuild Stats for ${target} @${cwd}: \n ${info}`
        )
        .join(`\n\n`)
    )
  }

  return
}
