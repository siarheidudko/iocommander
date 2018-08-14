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

class platform extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			platform: _.clone(store.adminpanelStorage.getState().task.platform)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.platform !== store.adminpanelStorage.getState().task.platform){
				self.setState({platform: _.clone(store.adminpanelStorage.getState().task.platform)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_PLATFORM', payload: {platform: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { 
		var adm_setTaskOptionPlatform = new Array;
	//	adm_setTaskOptionPlatform.push(<option value="">Выберите платформу</option>);
		adm_setTaskOptionPlatform.push(<option value="all" selected={(this.state.platform === 'all')?true:false}>Любая</option>);
		adm_setTaskOptionPlatform.push(<option value="win32" selected={(this.state.platform === 'win32')?true:false}>Windows</option>);
		adm_setTaskOptionPlatform.push(<option value="linux" selected={(this.state.platform === 'linux')?true:false}>Linux</option>);
		var adm_setTaskOptionPlatformSet = <p><select size="1" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOptionPlatform} </select></p>;
		return (
			<div> {adm_setTaskOptionPlatformSet} </div>
		);
	}
	
}

module.exports = platform;