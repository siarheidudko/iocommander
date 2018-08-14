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

class command extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			command: _.clone(store.adminpanelStorage.getState().task.command)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.command !== store.adminpanelStorage.getState().task.command){
				self.setState({command: _.clone(store.adminpanelStorage.getState().task.command)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\. \"\|\(\)\[\^\$\*\+\?\/&_:!<>@-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_COMMAND', payload: {command: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { 
		return (
			<div className="inputFieldCenterRight">Команда: <input type="text" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.command) === 'string')?this.state.command:null} /></div>
		);
	}
	
}

module.exports = command;