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

class url extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			url: _.clone(store.adminpanelStorage.getState().task.url)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.url !== store.adminpanelStorage.getState().task.url){
				self.setState({url: _.clone(store.adminpanelStorage.getState().task.url)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9\. \"\|\(\)\[\^\$\*\+\?\/&_:!<>@-].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_URL', payload: {url: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { 
		return (
			<div className="inputFieldCenterRight">Ссылка для скачки: <input type="text" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.url) === 'string')?this.state.url:null} /></div>
		);
	}
	
}

module.exports = url;