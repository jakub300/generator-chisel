const TinyQueue = require('tinyqueue');
const path = require('path');
const CreatorPluginAPI = require('./CreatorPluginAPI');

module.exports = class Creator {
  constructor(context, opts) {
    this.data = {};
    this.queue = new TinyQueue(
      [],
      (a, b) => a.priority - b.priority || a.index - b.index
    );
    this.context = context || process.env.CHISEL_CONTEXT || process.cwd();
    this.args = opts.args;
    this.cmd = opts.cmd;
    this.index = 0;
  }

  schedule(priority, action) {
    priority = parseFloat(priority);
    if (!priority) priority = 0;

    this.queue.push({ priority, index: this.index++, action });
  }

  async loadCreator(name) {
    const _path = path.join(__dirname, 'creators', name);
    const init = require(_path);
    return init(new CreatorPluginAPI(name, this));
  }

  async run() {
    while (this.queue.length) {
      const item = this.queue.pop();
      await item.action();
    }
  }
};
