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

class name extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			name: _.clone(store.adminpanelStorage.getState().task.name)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.name !== store.adminpanelStorage.getState().task.name){
				self.setState({name: _.clone(store.adminpanelStorage.getState().task.name)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_NAME', payload: {name: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { console.log('name');
		return (
			<div className="inputFieldCenterRight">Имя файла: <input type="text" onChange={this.onChangeHandler.bind(this)} value={this.state.name} /></div>
		);
	}
	
}

module.exports = name;