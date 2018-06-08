/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

var adminpanelStorage = require('./iocom.store.adminpanelStorage.js');
var serverStorage = require('./iocom.store.serverStorage.js');
var connectionStorage = require('./iocom.store.connectionStorage.js');

window.adminpanelStorage = adminpanelStorage;
window.serverStorage = serverStorage;
window.connectionStorage = connectionStorage;

module.exports.adminpanelStorage = adminpanelStorage;
module.exports.serverStorage = serverStorage;
module.exports.connectionStorage = connectionStorage;