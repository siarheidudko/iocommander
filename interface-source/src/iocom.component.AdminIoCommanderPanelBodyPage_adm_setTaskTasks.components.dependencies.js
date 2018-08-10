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

class dependencies extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			dependencies: _.clone(store.adminpanelStorage.getState().task.dependencies),
			reportkeys: _.keys(store.connectionStorage.getState().report)
		};
    }
	
	componentDidMount() {
		var self = this;
		store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.reportkeys, _.keys(store.connectionStorage.getState().report)))){
				self.setState({reportkeys: _.clone(_.keys(store.connectionStorage.getState().report))});
			}
		});
		store.adminpanelStorage.subscribe(function(){
			if(!(_.isEqual(self.state.dependencies,store.adminpanelStorage.getState().task.dependencies))){
				self.setState({dependencies: _.clone(store.adminpanelStorage.getState().task.dependencies)});
			}
		});
	}
	
	onChangeHandler(data){
		var _arr = _.clone(data);
		store.adminpanelStorage.dispatch({type:'SET_TASK_DEPENDENCIES', payload: {dependencies: _arr}});
	}
	
	render() { console.log('dependencies');
		var self = this;
		var _temp = {};
		for(const key in self.state.reportkeys){
			var dateEpochToString = new Date(store.connectionStorage.getState().report[self.state.reportkeys[key]].datetime);
			_temp[self.state.reportkeys[key]] = core.timeStamp(dateEpochToString) + '_' + store.connectionStorage.getState().report[self.state.reportkeys[key]].comment;
		}
		return (
			<div>
				<delphiform.form1 store={_temp} selected={self.state.dependencies} name="Зависимости:" callback={self.onChangeHandler} />
			</div>
		);
	}
	
}

module.exports = dependencies;