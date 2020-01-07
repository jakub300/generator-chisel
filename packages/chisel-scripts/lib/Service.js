// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/Service.js

const merge = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')

module.exports = class Service {
  constructor() {
    this.initialized = false;
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.commands = {}
    this.plugins = this.loadPlugins();
  }

  loadPlugins() {
    const idToPlugin = id => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id)
    })

    const builtInPlugins = [
      // './commands/serve',
      './commands/build',
      // config plugins are order sensitive
      './config/base',
      // './config/css',
      // './config/prod',
    ]

    const plugins = [];

    plugins.push(...builtInPlugins.map(idToPlugin));

    return plugins;
  }

  initializePlugins() {
    this.plugins.forEach((({id, apply}) => {
      apply(new PluginAPI(id, this));
    }))
  }

  init() {
    if(this.initialized) return;
    this.initialized = true;

    this.initializePlugins();
  }

  run(name, args) {
    this.init();

    const command = this.commands[name]
    this.resolveWebpackConfig();

    if(!command) {
      console.error(`command "${name}" does not exist.`)
      process.exit(1)
    }

  }

  resolveChainableWebpackConfig () {
    const chainableConfig = new Config()
    this.webpackChainFns.forEach(fn => fn(chainableConfig))
    return chainableConfig
  }

  resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
    // get raw config
    let config = chainableConfig.toConfig()
    const original = config
    // apply raw config fns
    // this.webpackRawConfigFns.forEach(fn => {
    //   if (typeof fn === 'function') {
    //     // function with optional return value
    //     const res = fn(config)
    //     if (res) config = merge(config, res)
    //   } else if (fn) {
    //     // merge literal values
    //     config = merge(config, fn)
    //   }
    // })
    //
    // #2206 If config is merged by merge-webpack, it discards the __ruleNames
    // information injected by webpack-chain. Restore the info so that
    // vue inspect works properly.
    // if (config !== original) {
    //   cloneRuleNames(
    //     config.module && config.module.rules,
    //     original.module && original.module.rules
    //   )
    // }
    const { toString } = require('webpack-chain')
    console.log(toString(config));
  }
}
