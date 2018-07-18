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

class AdminIoCommanderPanelBodyPage_adm_delUser extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			users: _.clone(store.serverStorage.getState().users),
			SelectUser: ""
		};
    }
 
 	componentDidMount() {
	    var self = this;
		store.serverStorage.subscribe(function(){
			if(!(_.isEqual(self.state.users, store.serverStorage.getState().users)) && (store.adminpanelStorage.getState().page === 'adm_delUser')){
				if(typeof(store.serverStorage.getState().users[self.state.SelectUser]) === 'undefined'){
					self.setState({users: _.clone(store.serverStorage.getState().users), SelectUser: ""});
				} else {
					self.setState({users: _.clone(store.serverStorage.getState().users)});
				}
			}
		});
	}
	
	onChangeHandler(e){
		this.setState({SelectUser: e.target.value});
	}
	
	onBtnClickHandler(e){
		var self = this;
		var user_name = self.state.SelectUser;
		if((typeof(user_name) === 'string') && (user_name !== '')){
			window.socket.emit('adm_delUser', [user_name]);
			self.setState({SelectUser: ''});
		} else {
			window.console.log("Некорректные аргументы!");
			core.popup("Некорректные аргументы!");
		}
	}
	
	render() {

		var adm_delUserOption = new Array;
		adm_delUserOption.push(<option value="">Выберите пользователя</option>);
		for(var keyUser in this.state.users){
			adm_delUserOption.push(<option value={keyUser} selected={(this.state.SelectUser === keyUser)?true:false} >{core.replacer(keyUser, false)}</option>);
		}
		var adm_delUser = <select size="1" name="SetSelectUser" onChange={this.onChangeHandler.bind(this)}> + {adm_delUserOption} + </select>;
		
		return ( 
			<div>
				{adm_delUser}&#8195;<button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Удалить пользователя</button>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_delUser;