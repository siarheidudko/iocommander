/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */
 
import core from './iocom.core.js';

"use strict"

var adminpanelStorage = require('redux').createStore(editAdmpanelStore);

function editAdmpanelStore(state = {auth: false, popuptext:'', session:{}, page:'adm_setTask'}, action){
	try {
		switch (action.type){
			case 'AUTH':
				var state_new = _.clone(state);
				state_new.auth = action.payload.auth;
				state_new.session = {};
				if(action.payload.auth === false){
					state_new.popuptext = 'Авторизация не пройдена!';
					state_new.session.login = '';
					state_new.session.password = '';
				} else {
					state_new.session.login = action.payload.login;
					state_new.session.password = action.payload.pass;
				}
				return state_new;
				break;
			case 'MSG_POPUP':
				var state_new = _.clone(state);
				state_new.popuptext = action.payload.popuptext;
				return state_new;
				break;
			case 'GET_PAGE':
				var state_new = _.clone(state);
				state_new.page = action.payload.page;
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		window.console.log("Ошибка при обновлении хранилища админпанели:" + e);
		core.popup("Ошибка при обновлении хранилища adminpanelStorage:" + e);
	}
	return state;
}

module.exports = adminpanelStorage;