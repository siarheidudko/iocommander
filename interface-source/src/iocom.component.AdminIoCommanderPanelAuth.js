 /**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import React from 'react';

var store = require('./iocom.store.js');
import core from './iocom.core.js';

"use strict"

class AdminIoCommanderPanelAuth extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			login: '',
			password: '',
		}
    }
	
	onChangeHandler(e){
		var self = this;
		switch(e.target.name){
			case 'SetParamlogin':
				if(e.target.value !== self.state.login){
					self.setState({login: e.target.value});
				}
				break;
			case 'SetParamPassword':
				if(e.target.value !== self.state.password){
					self.setState({password: e.target.value});
				}
				break;
		}
	}
	
	onBtnClickHandler(e){
		var self = this;
		if(e.target.id === 'submit'){
			core.initialiseSocket(self.state.login, self.state.password);
		}
	}
	
	render() {
		var AdminIoCommanderPanelAuth = new Array;
		var AdminIoCommanderPanelAuthForm = new Array;
		//поле ввода логина
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter" key={core.generateUID()} >Логин: <input type="text" name="SetParamlogin" autoComplete="username" onChange={this.onChangeHandler.bind(this)} value={this.state.login} /></div>);
		//поле ввода пароля
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter" key={core.generateUID()} >Пароль: <input type="password" name="SetParamPassword" autoComplete="current-password" onChange={this.onChangeHandler.bind(this)} value={this.state.password} /></div>);
		AdminIoCommanderPanelAuth.push(<form key={core.generateUID()} >{AdminIoCommanderPanelAuthForm}</form>);
		//кнопка входа
		AdminIoCommanderPanelAuth.push(<div className="inputFieldCenter" key={core.generateUID()} ><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Войти</button></div>);
		
		return (
			<div className="AdminIoCommanderPanelAuth">
				{AdminIoCommanderPanelAuth}
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelAuth;