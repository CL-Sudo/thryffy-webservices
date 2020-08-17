const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const dotenv = require('dotenv');
const pkg = require('./package.json');

const ROOT_DIR = path.resolve(__dirname, '.');
const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args);
const BUILD_DIR = resolvePath('build');
dotenv.config();

function overrideRules(rules, patch) {
  return rules.map(ruleToPatch => {
    let rule = patch(ruleToPatch);
    if (rule.rules) {
      rule = { ...rule, rules: overrideRules(rule.rules, patch) };
    }
    if (rule.oneOf) {
      rule = { ...rule, oneOf: overrideRules(rule.oneOf, patch) };
    }
    return rule;
  });
}

const config = {
  context: ROOT_DIR,
  mode: 'production',
  resolve: {
    modules: ['node_modules', 'src'],
    alias: {
      '@configs': path.resolve(__dirname, './src/configs'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@tools': path.resolve(__dirname, './src/tools'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@filters': path.resolve(__dirname, './src/filters'),
      '@middlewares': path.resolve(__dirname, './src/middlewares'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@listeners': path.resolve(__dirname, './src/listeners'),
      '@models': path.resolve(__dirname, './src/models'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@templates': path.resolve(__dirname, './src/templates')
    }
  },
  module: {
    // Make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      // Rules for JS / JSX
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: false,
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: pkg.browserslist
                },
                forceAllTransforms: true,
                modules: false,
                useBuiltIns: false,
                debug: false
              }
            ],
            '@babel/preset-flow'
          ]
        }
      }
    ]
  }
};

module.exports = {
  ...config,
  name: 'server',
  target: 'node',
  entry: {
    server: ['@babel/polyfill', resolvePath('./src/server.js')]
  },
  output: {
    ...config.output,
    path: BUILD_DIR,
    filename: 'server.bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    ...config.module,

    rules: overrideRules(config.module.rules, rule => {
      // Override babel-preset-env configuration for Node.js
      if (rule.loader === 'babel-loader') {
        return {
          ...rule,
          options: {
            ...rule.options,
            presets: rule.options.presets.map(preset =>
              preset[0] !== '@babel/preset-env'
                ? preset
                : [
                    '@babel/preset-env',
                    {
                      targets: {
                        node: pkg.engines.node.match(/(\d+\.?)+/)[0]
                      },
                      modules: false,
                      useBuiltIns: false,
                      debug: false
                    }
                  ]
            )
          }
        };
      }

      return rule;
    })
  },
  stats: {
    colors: true
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'DEV'),
      __DEV__: false
    }),

    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ],
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  }
};
