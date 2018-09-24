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

class AdminIoCommanderPanelBodyPage_adm_setAdmin extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			AdminLogin: "",
			AdminPass: "",
			AdminPassRepeat: ""
		};
    }
	
	onChangeHandler(e){
		switch(e.target.name){
			case 'SetAdminLogin':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					this.setState({AdminLogin: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetAdminPass':
				this.setState({AdminPass: e.target.value});
				break;
			case 'SetAdminPassRepeat':
				this.setState({AdminPassRepeat: e.target.value});
				break;
		}
	}
	
	onBtnClickHandler(e){
		var self = this;
		var user_name = self.state.AdminLogin;
		var user_pass = self.state.AdminPass;
		var user_pass_repeat = self.state.AdminPassRepeat;
		if(user_pass !== user_pass_repeat){
			window.console.log("Пароли не совпадают!");
			core.popup("Пароли не совпадают!");
		} else {
			if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
				window.socket.emit('adm_setAdmin', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
				self.setState({AdminLogin: '',AdminPass: '',AdminPassRepeat: ''});
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
						<div className="inputFieldCenter">Логин: <input type="text" name="SetAdminLogin" autoComplete="new-username" onChange={this.onChangeHandler.bind(this)} value={this.state.AdminLogin} /></div>
						<div className="inputFieldCenter">Пароль: <input type="password" name="SetAdminPass" autoComplete="new-password" onChange={this.onChangeHandler.bind(this)} value={this.state.AdminPass} /></div>
						<div className="inputFieldCenter">Повторите: <input type="password" name="SetAdminPassRepeat" autoComplete="new-password" onChange={this.onChangeHandler.bind(this)} value={this.state.AdminPassRepeat} /></div>
					</form>
				</div>
				<div className="inputFieldCenter">
					<br /><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Добавить администратора</button>
				</div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_setAdmin;