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
import tasks from './iocom.component.AdminIoCommanderPanelBodyPage_adm_setTaskTasks.js';

"use strict"

class AdminIoCommanderPanelBodyPage_adm_setTask extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			task_uid: _.clone(store.adminpanelStorage.getState().task.uid), 
			task_type: _.clone(store.adminpanelStorage.getState().task.type) 
		};
    }
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if((self.state.task_uid !== store.adminpanelStorage.getState().task.uid) || (self.state.task_type !== store.adminpanelStorage.getState().task.type)){
				self.setState({task_uid: _.clone(store.adminpanelStorage.getState().task.uid), task_type: _.clone(store.adminpanelStorage.getState().task.type)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'SetTaskType':
				store.adminpanelStorage.dispatch({type:'GET_TASK', payload: {task_type: _.clone(e.target.value)}});
				break;
		}
	}
	
	render() {
		//выпадающий список типов заданий
		var adm_setTaskOption = new Array;
		adm_setTaskOption.push(<option key={core.generateUID()} value="getFileFromWWW">Скачать файл по ссылке</option>);
		adm_setTaskOption.push(<option key={core.generateUID()} value="getFileFromFileserver">Передать файл</option>);
		adm_setTaskOption.push(<option key={core.generateUID()} value="execFile">Запустить локальный скрипт</option>);
		adm_setTaskOption.push(<option key={core.generateUID()} value="execCommand">Выполнить команду</option>);
		var adm_setTask = <p><select size="1" name="SetTaskType" onChange={this.onChangeHandler.bind(this)} value={this.state.task_type}> {adm_setTaskOption} </select></p>;
		switch(this.state.task_type){
			case 'getFileFromWWW':
				var task = <tasks.getFileFromWWW />;
				break;
			case 'getFileFromFileserver':
				var task = <tasks.getFileFromFileserver />;
				break;
			case 'execFile':
				var task = <tasks.execFile />;
				break;
			case 'execCommand':
				var task = <tasks.execCommand />;
				break;
		}
		return (
			<div>
				<div>UID: {this.state.task_uid}</div>
				<div> {adm_setTask} </div>
				<div> {task} </div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_setTask;