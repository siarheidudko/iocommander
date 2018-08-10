 /**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import CryptoJS from 'crypto-js';
import React from 'react';

var store = require('./iocom.store.js');
import core from './iocom.core.js';
import TaskComponents from './iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.components.js';

"use strict"

class getFileFromWWW extends React.Component{

	constructor(props, context){
		super(props, context);
    }

	onBtnClickHandler(e){
		if(e.target.id === 'submit'){
			if(typeof(window.socket) !== 'undefined'){
				if((typeof(store.adminpanelStorage.getState().task.uid) === 'string') && (store.adminpanelStorage.getState().task.uid !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.type) === 'string') && (store.adminpanelStorage.getState().task.type !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.url) === 'string') && (store.adminpanelStorage.getState().task.url !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.name) === 'string') && (store.adminpanelStorage.getState().task.name !== '')
				&& (typeof(store.adminpanelStorage.getState().task.start) === 'boolean')
				&& (typeof(store.adminpanelStorage.getState().task.platform) === 'string') && (store.adminpanelStorage.getState().task.platform !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.comment) === 'string')
				&& (typeof(store.adminpanelStorage.getState().task.dependencies) === 'object') && (typeof(store.adminpanelStorage.getState().task.tradeobj) === 'object')){
					var timeOnCompl;
					try {
						timeOnCompl = new Date(store.adminpanelStorage.getState().task.time);
					} catch(e){
						timeOnCompl = new Date(0);
					}
					if((typeof(store.adminpanelStorage.getState().task.path) !== 'string') || (store.adminpanelStorage.getState().task.path === '')){
						var intLinkReal = '/tmp/iocom/';
					} else {
						var intLinkReal = store.adminpanelStorage.getState().task.path;
					}
					var tempTask = {
						uid:store.adminpanelStorage.getState().task.uid, 
						task: {
							nameTask:store.adminpanelStorage.getState().task.type, 
							extLink:store.adminpanelStorage.getState().task.url, 
							intLink:intLinkReal, 
							fileName: store.adminpanelStorage.getState().task.name, 
							exec:store.adminpanelStorage.getState().task.start.toString(), 
							platform:store.adminpanelStorage.getState().task.platform, 
							dependencies:store.adminpanelStorage.getState().task.dependencies, 
							comment:store.adminpanelStorage.getState().task.comment, 
							timeoncompl:timeOnCompl.getTime()
						}
					};
					if(store.adminpanelStorage.getState().task.tradeobj.length > 0){
						for(var i=0;i<store.adminpanelStorage.getState().task.tradeobj.length;i++){
							var EmitMessage = new Array(store.adminpanelStorage.getState().task.tradeobj[i], tempTask);
							window.socket.emit('adm_setTask', EmitMessage);
						}
						store.adminpanelStorage.dispatch({type:'CLEAR_TASK'});
						core.popup("Задача отправлена на сервер!");
					} else {
						window.console.log("Не выбраны клиенты!");
						core.popup("Не выбраны клиенты!");
					}
				} else {
					window.console.log("Некорректные аргументы!");
					core.popup("Некорректные аргументы!");
				}
			} else {
				window.console.log("Сокет недоступен!");
				core.popup("Сокет недоступен!");
			}
		}
	}
	
	render() {
		return (
			<div>
				<TaskComponents.comment />
				<TaskComponents.time />
				<TaskComponents.url />
				<TaskComponents.path />
				<TaskComponents.name />
				<TaskComponents.start />
				<TaskComponents.platform />
				<TaskComponents.dependencies />
				<TaskComponents.group />
				<TaskComponents.tradeobj />
				<div className="AdminIoCommanderPanelBodyBottom inputFieldCenterRight inputFieldCenterRightBotton"><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Выполнить</button></div>
			</div>	
		);
	}
	
}

module.exports = getFileFromWWW;