const TinyQueue = require('tinyqueue');
const path = require('path');
const CreatorPluginAPI = require('./CreatorPluginAPI');

module.exports = class Creator {
  constructor(context) {
    this.data = {};
    this.queue = new TinyQueue([], (a, b) => a.priority - b.priority);
    this.context = (context || process.env.CHISEL_CONTEXT || process.cwd());
  }

  schedule(priority, action) {
    priority = parseFloat(priority);
    if (!priority) priority = 0;

    this.queue.push({ priority, action });
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
