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

class AdminIoCommanderPanelBodyHeader extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			page: _.clone(store.adminpanelStorage.getState().page)
		}
    }
	
	onClickHandler(e){
		switch(e.target.name){
			case 'getpage':
				store.adminpanelStorage.dispatch({type:'GET_PAGE', payload: {page:e.target.id}});
				break;
			default:
				break;
		}
	}
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.page !== store.adminpanelStorage.getState().page){
				self.setState({page: _.clone(store.adminpanelStorage.getState().page)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	render() {
		return (
			<div><center><p>
				<img className="imgCommandType" src="./img/adm_settask.png" alt="Добавить задачу" title="Добавить задачу" name="getpage" id="adm_setTask" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_setTask')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_setuser.png" alt="Добавить пользователя" title="Добавить пользователя" name="getpage" id="adm_setUser" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_setUser')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_deluser.png" alt="Удалить пользователя" title="Удалить пользователя" name="getpage" id="adm_delUser" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_delUser')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_setadmin.png" alt="Добавить администратора" title="Добавить администратора" name="getpage" id="adm_setAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_setAdmin')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_deladmin.png" alt="Удалить администратора" title="Удалить администратора" name="getpage" id="adm_delAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_delAdmin')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_report.png" alt="Отчеты по таскам" title="Отчеты по таскам" name="getpage" id="adm_TaskReport" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_TaskReport')?"2":"0"} />
				<img className="imgCommandType" src="./img/adm_online.png" alt="Текущие соединения" title="Текущие соединения" name="getpage" id="adm_TaskOnline" onClick={this.onClickHandler.bind(this)} border={(this.state.page === 'adm_TaskOnline')?"2":"0"} />
			</p></center></div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyHeader;