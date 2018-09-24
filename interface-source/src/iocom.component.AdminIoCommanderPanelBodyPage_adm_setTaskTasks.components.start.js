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

class start extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			start: _.clone(store.adminpanelStorage.getState().task.start)
		};
    }
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.start !== store.adminpanelStorage.getState().task.start){
				self.setState({start: _.clone(store.adminpanelStorage.getState().task.start)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		store.adminpanelStorage.dispatch({type:'SET_TASK_START', payload: {start: _.clone(e.target.checked)}});
	}
	
	render() { 
		return (
			<div className="inputFieldCenterRight">Запустить: <input type="checkbox" onChange={this.onChangeHandler.bind(this)} checked={this.state.start} /></div>
		);
	}
	
}

module.exports = start;