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
			UserPass: "",
			UserPassRepeat: ""
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
			case 'SetUserPassRepeat':
				this.setState({UserPassRepeat: e.target.value});
				break;
		}
	}
	
	onBtnClickHandler(e){
		var self = this;
		var user_name = self.state.UserLogin;
		var user_pass = self.state.UserPass;
		var user_pass_repeat = self.state.UserPassRepeat;
		if(user_pass !== user_pass_repeat){
			window.console.log("Пароли не совпадают!");
			core.popup("Пароли не совпадают!");
		} else {
			if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
				window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
				self.setState({UserLogin: '',UserPass: '',UserPassRepeat: ''});
				core.popup("Задача отправлена на сервер!");
			} else {
				window.console.log("Некорректные аргументы!");
				core.popup("Некорректные аргументы!");
			}
		}
	}
	
	render() {	
		return ( 
			<div>
				<div>
					<form>
						<div className="inputFieldCenter">Логин: <input type="text" name="SetUserLogin" autoComplete="new-username" onChange={this.onChangeHandler.bind(this)} value={this.state.UserLogin} /></div>
						<div className="inputFieldCenter">Пароль: <input type="password" name="SetUserPass" autoComplete="new-password" onChange={this.onChangeHandler.bind(this)} value={this.state.UserPass} /></div>
						<div className="inputFieldCenter">Повторите: <input type="password" name="SetUserPassRepeat" autoComplete="new-password" onChange={this.onChangeHandler.bind(this)} value={this.state.UserPassRepeat} /></div>
					</form>
				</div>
				<div className="inputFieldCenter">
					<br /><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Добавить пользователя</button>
				</div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_setUser;