 /**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

var store = require('./iocom.store.js');
import core from './iocom.core.js';

"use strict"

class AdminIoCommanderPanelAuth extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			login: '',
			password: ''
		}
    }
	
	onBtnClickHandler(e){
		var self = this;
		if(e.target.id === 'submit'){
			core.initialiseSocket(ReactDOM.findDOMNode(this.refs.login).value, ReactDOM.findDOMNode(this.refs.password).value);
		}
	}
	
	render() {
		var AdminIoCommanderPanelAuth = new Array;
		var AdminIoCommanderPanelAuthForm = new Array;
		//поле ввода логина
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter" key={core.generateUID()} >Логин: <input type="text" name="SetParamlogin" autoComplete="username" ref="login" /></div>);
		//поле ввода пароля
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter" key={core.generateUID()} >Пароль: <input type="password" name="SetParamPassword" autoComplete="current-password" ref="password" /></div>);
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