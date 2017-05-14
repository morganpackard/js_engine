var imported = require('./my_module');
delete require.cache[require.resolve('./my_module')];
var imported22 = require('./my_module');
