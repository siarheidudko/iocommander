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

"use strict"

class AdminIoCommanderPanelBodyPage_adm_setTask extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			task_uid: core.generateUID(),
			task_type: "getFileFromFileserver"
		};
    }
	
	componentDidMount() {
		var self = this;
	}
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'SetTaskType':
				self.setState({task_type: e.target.value, task_uid: core.generateUID()});
				break;
		}
	}
	
	onBtnClickHandler(e){
	}
	
	render() {
		//выпадающий список типов заданий
		var adm_setTaskOption = new Array;
		adm_setTaskOption.push(<option value="getFileFromWWW" selected={(this.state.task_type === 'getFileFromWWW')?true:false}>Скачать файл по ссылке</option>);
		adm_setTaskOption.push(<option value="getFileFromFileserver" selected={(this.state.task_type === 'getFileFromFileserver')?true:false}>Передать файл</option>);
		adm_setTaskOption.push(<option value="execFile" selected={(this.state.task_type === 'execFile')?true:false}>Запустить локальный скрипт</option>);
		adm_setTaskOption.push(<option value="execCommand" selected={(this.state.task_type === 'execCommand')?true:false}>Выполнить команду</option>);
		var adm_setTask = <p><select size="1" name="SetTaskType" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOption} </select></p>;
		
		return (
			<div>
				<div>{this.state.task_uid}</div>
				<div> {adm_setTask} </div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_setTask;