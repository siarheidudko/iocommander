/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */
 
import core from './iocom.core.js';

"use strict"

var adminpanelStorage = require('redux').createStore(editAdmpanelStore);

function editAdmpanelStore(state = {
	auth: false, 
	popuptext:'', 
	session:{}, 
	page:'adm_setTask', 
	task:{
		type:'getFileFromFileserver', 
		uid: '', 
		comment:'', 
		time:(new Date()).getTime(), 
		platform:'win32', 
		dependencies:[], 
		group:'', 
		tradeobj:[], 
		url:'', 
		path:'', 
		name:'', 
		param:'', 
		command:'', 
		start:false
	}
}, action){
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
				state_new.task = {
					type:state_new.task.type, 
					uid: core.generateUID(), 
					comment:'', 
					time:(new Date()).getTime(), 
					platform:state_new.task.platform, 
					dependencies:[], 
					group:'', 
					tradeobj:[], 
					url:'', 
					path:'', 
					name:'', 
					param:'', 
					command:'', 
					start:false
				};
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
				state_new.task = {
					type:state_new.task.type, 
					uid: core.generateUID(), 
					comment:'', 
					time:(new Date()).getTime(), 
					platform:state_new.task.platform, 
					dependencies:[], 
					group:'', 
					tradeobj:[], 
					url:'', 
					path:'', 
					name:'', 
					param:'', 
					command:'', 
					start:false
				};
				return state_new;
				break;
			case 'GET_TASK':
				var state_new = _.clone(state);
				state_new.task.type = action.payload.task_type;
				state_new.task.uid = core.generateUID();
				state_new.task = {
					type:state_new.task.type, 
					uid: core.generateUID(), 
					comment:'', 
					time:(new Date()).getTime(), 
					platform:state_new.task.platform, 
					dependencies:[], 
					group:'', 
					tradeobj:[], 
					url:'', 
					path:'', 
					name:'', 
					param:'', 
					command:'', 
					start:false
				};
				return state_new;
				break;
			case 'SET_TASK_COMMENT':
				var state_new = _.clone(state);
				state_new.task.comment = action.payload.comment;
				return state_new;
				break;
			case 'SET_TASK_TIME':
				var state_new = _.clone(state);
				state_new.task.time = action.payload.time;
				return state_new;
				break;
			case 'SET_TASK_PLATFORM':
				var state_new = _.clone(state);
				state_new.task.platform = action.payload.platform;
				return state_new;
				break;
			case 'SET_TASK_DEPENDENCIES':
				var state_new = _.clone(state); 
				state_new.task.dependencies = _.clone(action.payload.dependencies);
				return state_new;
				break;
			case 'SET_TASK_GROUP': 
				var state_new = _.clone(state);
				state_new.task.group = _.clone(action.payload.group);
				for(const key in action.payload.tradeobj){
					if(state_new.task.group !== ''){
						if(state_new.task.tradeobj.indexOf(action.payload.tradeobj[key]) === -1){
							state_new.task.tradeobj.push(action.payload.tradeobj[key]);
						}
					} else {
						if(state_new.task.tradeobj.indexOf(action.payload.tradeobj[key]) !== -1){
							state_new.task.tradeobj.splice(state_new.task.tradeobj.indexOf(action.payload.tradeobj[key]), 1);
						}
					}
				}
				return state_new;
				break;
			case 'SET_TASK_TRADEOBJ':
				var state_new = _.clone(state); 
				state_new.task.tradeobj = _.clone(action.payload.tradeobj);
				return state_new;
				break;
			case 'SET_TASK_URL':
				var state_new = _.clone(state);
				state_new.task.url = action.payload.url;
				return state_new;
				break;
			case 'SET_TASK_PATH':
				var state_new = _.clone(state);
				state_new.task.path = action.payload.path;
				return state_new;
				break;
			case 'SET_TASK_NAME':
				var state_new = _.clone(state);
				state_new.task.name = action.payload.name;
				return state_new;
				break;
			case 'SET_TASK_PARAM':
				var state_new = _.clone(state);
				state_new.task.param = action.payload.param;
				return state_new;
				break;
			case 'SET_TASK_COMMAND':
				var state_new = _.clone(state);
				state_new.task.command = action.payload.command;
				return state_new;
				break;
			case 'SET_TASK_START':
				var state_new = _.clone(state);
				state_new.task.start = action.payload.start;
				return state_new;
				break;
			case 'CLEAR_TASK':
				var state_new = _.clone(state);
				state_new.task = {
					type:state_new.task.type, 
					uid: core.generateUID(), 
					comment:'', 
					time:(new Date()).getTime(), 
					platform:state_new.task.platform, 
					dependencies:[], 
					group:'', 
					tradeobj:[], 
					url:'', 
					path:'', 
					name:'', 
					param:'', 
					command:'', 
					start:false
				};
				return state_new;
				break;
			default:
				return state;
				break;
		}
	} catch(e){
		window.console.log("Ошибка при обновлении хранилища админпанели:" + e);
		core.popup("Ошибка при обновлении хранилища adminpanelStorage:" + e);
	}
	return state;
}

module.exports = adminpanelStorage;