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

class path extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			path: _.clone(store.adminpanelStorage.getState().task.path)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.path !== store.adminpanelStorage.getState().task.path){
				self.setState({path: _.clone(store.adminpanelStorage.getState().task.path)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_PATH', payload: {path: _.clone(e.target.value.replace(/\\/gi,"/"))}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { 
		return (
			<div className="inputFieldCenterRight">Локальный путь: <input type="text" onChange={this.onChangeHandler.bind(this)} value={this.state.path} /></div>
		);
	}
	
}

module.exports = path;