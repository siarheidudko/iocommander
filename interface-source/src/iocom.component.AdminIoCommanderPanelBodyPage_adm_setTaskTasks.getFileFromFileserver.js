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

class getFileFromFileserver extends React.Component{

	constructor(props, context){
		super(props, context);
    }

	onBtnClickHandler(e){
		if(e.target.id === 'submit'){
			if(typeof(window.socket) !== 'undefined'){
				if((typeof(store.adminpanelStorage.getState().task.uid) === 'string') && (store.adminpanelStorage.getState().task.uid !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.type) === 'string') && (store.adminpanelStorage.getState().task.type !== '') 
				&& (typeof(store.adminpanelStorage.getState().task.path) === 'string')
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
					if(store.adminpanelStorage.getState().task.path === ''){
						var intLinkReal = '/tmp/iocom/';
					} else {
						var intLinkReal = store.adminpanelStorage.getState().task.path;
					}
					if(store.adminpanelStorage.getState().task.tradeobj.length > 0){
						core.SendFileToInternalFS(window.files, store.adminpanelStorage.getState().task.uid, intLinkReal, store.adminpanelStorage.getState().task.platform, store.adminpanelStorage.getState().task.dependencies, store.adminpanelStorage.getState().task.comment, timeOnCompl, store.adminpanelStorage.getState().task.tradeobj, store.adminpanelStorage.getState().task.start.toString());
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
				<TaskComponents.file />
				<TaskComponents.path />
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

module.exports = getFileFromFileserver;