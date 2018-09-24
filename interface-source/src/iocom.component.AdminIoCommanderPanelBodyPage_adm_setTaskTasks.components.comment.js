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

class comment extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			comment: _.clone(store.adminpanelStorage.getState().task.comment)
		};
    }
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.comment !== store.adminpanelStorage.getState().task.comment){
				self.setState({comment: _.clone(store.adminpanelStorage.getState().task.comment)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^A-z0-9А-я ].*$");
		if(!regexp.test(e.target.value)){
			store.adminpanelStorage.dispatch({type:'SET_TASK_COMMENT', payload: {comment: _.clone(e.target.value)}});
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { 
		return (
			<div className="inputFieldCenterRight">Комментарий (для поиска): <input type="text" onChange={this.onChangeHandler.bind(this)} value={this.state.comment} /></div>
		);
	}
	
}

module.exports = comment;