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

class AdminIoCommanderPanelBodyPage_adm_setUser extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			UserLogin: "",
			UserPass: ""
		};
    }
	
	onChangeHandler(e){
		switch(e.target.name){
			case 'SetUserLogin':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					this.setState({UserLogin: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetUserPass':
				this.setState({UserPass: e.target.value});
				break;
		}
	}
	
	onBtnClickHandler(e){
		var self = this;
		var user_name = self.state.UserLogin;
		var user_pass = self.state.UserPass;
		if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
			window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
			self.setState({UserLogin: '',UserPass: ''});
		} else {
			window.console.log("Некорректные аргументы!");
			core.popup("Некорректные аргументы!");
		}
	}
	
	render() {	
		return ( 
			<div>
				<div>
					<div className="inputFieldCenter">Логин: <input type="text" name="SetUserLogin" onChange={this.onChangeHandler.bind(this)} value={this.state.UserLogin} /></div>
					<div className="inputFieldCenter">Пароль: <input type="text" name="SetUserPass" onChange={this.onChangeHandler.bind(this)} value={this.state.UserPass} /></div>
				</div>
				<div className="inputFieldCenter">
					<br /><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Добавить пользователя</button>
				</div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_setUser;