/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

var getFileFromWWW = require('./iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.getFileFromWWW.js');
var getFileFromFileserver = require('./iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.getFileFromFileserver.js');
var execFile = require('./iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.execFile.js');
var execCommand = require('./iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.execCommand.js');

module.exports.getFileFromWWW = getFileFromWWW;
module.exports.getFileFromFileserver = getFileFromFileserver;
module.exports.execFile = execFile;
module.exports.execCommand = execCommand;