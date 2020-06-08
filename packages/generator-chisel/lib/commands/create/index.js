const TinyQueue = require('tinyqueue');
const Creator = require('./Creator');

const createCommand = async () => {
  const creator = new Creator();

  await creator.loadCreator('app');

  return creator.run();
}

module.exports = createCommand;
