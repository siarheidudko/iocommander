/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import core from './iocom.core.js';

"use strict"

var connectionStorage = require('redux').createStore(editConnStore);

function editConnStore(state = {uids:{}, users:{}, versions:{}, version:'', report:{}, groups:{}, iptoban:{}, fileport:'', memory:'', cpu:''}, action){
	try {
		switch (action.type){
			case 'SYNC_OBJECT':
				var state_new = _.clone(action.payload);
				return state_new;
				break;
			case 'CLEAR_STORAGE':
				var state_new = {uids:{}, users:{}, versions:{}, version:'', report:{}, groups:{}, iptoban:{}, fileport:'', memory:'', cpu:''};
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