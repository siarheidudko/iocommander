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

class param extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			param: _.clone(store.adminpanelStorage.getState().task.param)
		};
    }
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.param !== store.adminpanelStorage.getState().task.param){
				self.setState({param: _.clone(store.adminpanelStorage.getState().task.param)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_PARAM', payload: {param: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() {
		return (
			<div className="inputFieldCenterRight">Параметры запуска: <input type="text" onChange={this.onChangeHandler.bind(this)} value={this.state.param} /></div>
		);
	}
	
}

module.exports = param;