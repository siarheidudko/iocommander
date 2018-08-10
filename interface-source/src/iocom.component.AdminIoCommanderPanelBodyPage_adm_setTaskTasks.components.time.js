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

class time extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			time: _.clone(store.adminpanelStorage.getState().task.time)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.time !== store.adminpanelStorage.getState().task.time){
				self.setState({time: _.clone(store.adminpanelStorage.getState().task.time)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		var regexp = new RegExp("^.*[^0-9T:-].*$");
		if(!regexp.test(e.target.value)){
			//2018-03-19T18:37:00
			switch(e.target.value.length){
				case 4:
					store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)+'-'}});
					break;
				case 7:
					store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)+'-'}});
					break;
				case 10:
					store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)+'T'}});
					break;
				case 13:
					store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)+':'}});
					break;
				case 16:
					store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)+':'}});
					break;
				default:
					if(e.target.value.length < 20){
						store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.target.value)}});
					}
					break;
			}
		} else {
			core.popup('Некорректный символ!');
		}
	}
	
	render() { console.log('time');
		return (
			<div className="inputFieldCenterRight">Выполнить после (2018-03-19T18:37:00): <input type="text" onChange={this.onChangeHandler.bind(this)} value={this.state.time} /></div>
		);
	}
	
}

module.exports = time;