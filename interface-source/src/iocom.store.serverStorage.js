/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */
 
import _ from 'lodash';
import core from './iocom.core.js';

"use strict"

var serverStorage = require('redux').createStore(editServerStore);

function editServerStore(state = {users:{}, admins:{}, tasks: {}}, action){
	try {
		switch (action.type){
			case 'SYNC_OBJECT':
				var state_new = _.clone(action.payload);
				return state_new;
				break;
			case 'CLEAR_STORAGE':
				var state_new = {users:{}, admins:{}, tasks: {}};
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		window.console.log("Ошибка при обновлении хранилища:" + e);
		core.popup("Ошибка при обновлении хранилища serverStorage:" + e);
	}
	return state;
}

module.exports = serverStorage;