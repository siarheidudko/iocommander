/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import core from './iocom.core.js';

"use strict"

var connectionStorage = require('redux').createStore(editConnStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

function editConnStore(state = {uids:{}, users:{}, versions:{}, version:'', report:{}, groups:{}, iptoban:{}, fileport:'', memory:'', cpu:''}, action){
	try {
		switch (action.type){
			case 'SYNC_OBJECT':
				var state_new = action.payload;
				return state_new;
				break;
			case 'CLEAR_STORAGE':
				var state_new = {uids:{}, users:{}};
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		window.console.log("Ошибка при обновлении хранилища соединений:" + e);
		core.popup("Ошибка при обновлении хранилища connectionStorage:" + e);
	}
	return state;
}

module.exports = connectionStorage;