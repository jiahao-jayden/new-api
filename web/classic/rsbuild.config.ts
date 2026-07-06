import fs from 'node:fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const semiUiDir = path.resolve(
  path.dirname(require.resolve('@douyinfe/semi-ui')),
  '../..',
)
const dateFnsV2Dir = path.dirname(require.resolve('date-fns-v2/package.json'))
const vchartDir = path.dirname(require.resolve('@visactor/vchart/package.json'))
// Alias each @visactor sub-package to the copy that matches @visactor/vchart.
// Depending on the installer's hoisting the copy may live nested inside vchart
// (`.../@visactor/vchart/node_modules/@visactor/<name>`, e.g. a full workspace
// install) or hoisted as a sibling of vchart (`.../@visactor/<name>`, e.g.
// `bun install --filter ./classic` in the Docker build). Probe both layouts and
// skip when neither exists so the bundler falls back to normal resolution.
const vchartDependencyAliases = Object.fromEntries(
  [
    'vdataset',
    'vrender-components',
    'vrender-core',
    'vrender-kits',
    'vscale',
    'vutils',
    'vutils-extension',
  ]
    .map((name) => {
      const nested = path.join(vchartDir, 'node_modules/@visactor', name)
      const sibling = path.join(path.dirname(vchartDir), name)
      const target = [nested, sibling].find((dir) =>
        fs.existsSync(path.join(dir, 'package.json')),
      )
      return target ? [`@visactor/${name}`, target] : null
    })
    .filter((entry): entry is [string, string] => entry !== null),
)

export default defineConfig(({ envMode }) => {
  const env = loadEnv({ mode: envMode, prefixes: ['VITE_'] })
  const clientServerUrl =
    process.env.VITE_REACT_APP_SERVER_URL ||
    env.rawPublicVars.VITE_REACT_APP_SERVER_URL ||
    ''
  const proxyServerUrl =
    clientServerUrl ||
    'http://localhost:3000'
  const isProd = envMode === 'production'
  const devProxy = Object.fromEntries(
    (['/api', '/mj', '/pg'] as const).map((key) => [
      key,
      { target: proxyServerUrl, changeOrigin: true },
    ]),
  ) as Record<string, { target: string; changeOrigin: boolean }>

  return {
    plugins: [pluginReact()],
    source: {
      entry: {
        index: './src/index.jsx',
      },
      define: {
        'import.meta.env.VITE_REACT_APP_SERVER_URL': JSON.stringify(
          clientServerUrl,
        ),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'date-fns': dateFnsV2Dir,
        ...vchartDependencyAliases,
        '@douyinfe/semi-ui/dist/css/semi.css': path.resolve(
          semiUiDir,
          'dist/css/semi.css',
        ),
      },
    },
    html: {
      template: './index.html',
    },
    server: {
      host: '0.0.0.0',
      strictPort: false,
      proxy: devProxy,
    },
    output: {
      minify: isProd,
      target: 'web',
      distPath: {
        root: 'dist',
      },
    },
    performance: {
      removeConsole: isProd ? ['log'] : false,
      buildCache: {
        cacheDigest: [process.env.VITE_REACT_APP_VERSION],
      },
    },
    tools: {
      rspack: {
        module: {
          rules: [
            {
              test: /src[\\/].*\.js$/,
              type: 'javascript/auto',
              use: [
                {
                  loader: 'builtin:swc-loader',
                  options: {
                    jsc: {
                      parser: {
                        syntax: 'ecmascript',
                        jsx: true,
                      },
                      transform: {
                        react: {
                          runtime: 'automatic',
                          development: !isProd,
                          refresh: !isProd,
                        },
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
  }
})
