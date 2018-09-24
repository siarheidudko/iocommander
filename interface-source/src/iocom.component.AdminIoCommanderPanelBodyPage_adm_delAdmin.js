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

class AdminIoCommanderPanelBodyPage_adm_delAdmin extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			admins: _.clone(store.serverStorage.getState().admins),
			SelectAdmin: ""
		};
    }
 
 	componentDidMount() {
	    var self = this;
		var cancel = store.serverStorage.subscribe(function(){
			if(!(_.isEqual(self.state.admins, store.serverStorage.getState().admins)) && (store.adminpanelStorage.getState().page === 'adm_delAdmin')){
				if(typeof(store.serverStorage.getState().admins[self.state.SelectAdmin]) === 'undefined'){
					self.setState({admins: _.clone(store.serverStorage.getState().admins), SelectAdmin: ""});
				} else {
					self.setState({admins: _.clone(store.serverStorage.getState().admins)});
				}
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		this.setState({SelectAdmin: e.target.value});
	}
	
	onBtnClickHandler(e){
		var self = this;
		var user_name = self.state.SelectAdmin;
		if((typeof(user_name) === 'string') && (user_name !== '')){
			window.socket.emit('adm_delAdmin', [user_name]);
			self.setState({SelectAdmin: ''});
			core.popup("Задача отправлена на сервер!");
		} else {
			window.console.log("Некорректные аргументы!");
			core.popup("Некорректные аргументы!");
		}
	}
	
	render() {

		var adm_delAdminOption = new Array;
		adm_delAdminOption.push(<option key={core.generateUID()} value="">Выберите пользователя</option>);
		for(var keyAdmin in this.state.admins){
			adm_delAdminOption.push(<option key={core.generateUID()} value={keyAdmin}>{core.replacer(keyAdmin, false)}</option>);
		}
		var adm_delAdmin = <select size="1" name="SetSelectAdmin" onChange={this.onChangeHandler.bind(this)} value={this.state.SelectAdmin}> + {adm_delAdminOption} + </select>;
		
		return ( 
			<div>
				{adm_delAdmin}&#8195;<button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Удалить администратора</button>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_delAdmin;