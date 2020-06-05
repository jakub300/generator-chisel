// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/Service.js

const merge = require('webpack-merge')
const Config = require('webpack-chain')
const PluginAPI = require('./PluginAPI')
const path = require('path');

module.exports = class Service {
  constructor(context) {
    this.initialized = false;
    this.webpackChainFns = []
    this.webpackRawConfigFns = []
    this.commands = {}
    this.context = (context || process.env.CHISEL_CONTEXT || process.cwd());
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
      './commands/inspect',
      // config plugins are order sensitive
      './config/base',
      './config/js',
      './config/css',
      // './config/prod',
    ]

    const plugins = [];

    plugins.push(...builtInPlugins.map(idToPlugin));

    return plugins;
  }

  async initializePlugins() {
    for(const {id, apply} of this.plugins) {
      await apply(new PluginAPI(id, this), this.projectOptions);
    }
  }

  async init() {
    if(this.initialized) return;
    this.initialized = true;

    const userOptions = require(path.join(this.context, 'chisel.config.js'));
    this.projectOptions = userOptions;

    if(Array.isArray(userOptions.plugins)) {
      userOptions.plugins.forEach((plugin, index) => {
        if(typeof plugin === 'string') {
          this.plugins.push({id: plugin, apply: require(plugin)})
        } else if(typeof plugin === 'function') {
          this.plugins.push({id: plugin.name || `plugin${index}`, apply: plugin})
        }
      })
    }

    await this.initializePlugins();
  }

  async run(name, args) {
    await this.init();

    const command = this.commands[name]

    if(!command) {
      console.error(`command "${name}" does not exist.`)
      process.exit(1)
    }

    return command.fn(args);
  }

  async resolveChainableWebpackConfig () {
    const chainableConfig = new Config()
    for(const fn of this.webpackChainFns) {
      await fn(chainableConfig);
    }
    return chainableConfig
  }

  async resolveWebpackConfig(chainableConfig) {
    if(!chainableConfig) {
      chainableConfig = await  this.resolveChainableWebpackConfig();
    }
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
    return config;
  }
}
