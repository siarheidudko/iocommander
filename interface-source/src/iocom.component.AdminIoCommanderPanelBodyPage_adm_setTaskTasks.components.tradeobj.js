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
import delphiform from 'delphiform';

"use strict"

class tradeobj extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			tradeobj: _.clone(store.adminpanelStorage.getState().task.tradeobj),
			objects: _.keys(store.serverStorage.getState().users)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.serverStorage.subscribe(function(){
			if(!(_.isEqual(self.state.objects, _.keys(store.serverStorage.getState().users)))){
				self.setState({objects: _.clone(_.keys(store.serverStorage.getState().users))});
			}
		});
		store.adminpanelStorage.subscribe(function(){
			if(!(_.isEqual(self.state.tradeobj,store.adminpanelStorage.getState().task.tradeobj))){
				self.setState({tradeobj: _.clone(store.adminpanelStorage.getState().task.tradeobj)});
			}
		});
	}
	
	onChangeHandler(data){
		var _arr = _.clone(data);
		store.adminpanelStorage.dispatch({type:'SET_TASK_TRADEOBJ', payload: {tradeobj: _arr}});
	}
	
	render() { console.log('tradeobj');
		var self = this;
		var _temp = {};
		for(const key in self.state.objects){
			_temp[core.replacer(self.state.objects[key], false)] = core.replacer(self.state.objects[key], false);
		}
		return (
			<delphiform.form1 store={_temp} selected={self.state.tradeobj} callback={self.onChangeHandler} />
		);
	}
	
}

module.exports = tradeobj;