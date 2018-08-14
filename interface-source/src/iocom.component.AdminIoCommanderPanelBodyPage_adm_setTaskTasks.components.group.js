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

class group extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			group: _.clone(store.adminpanelStorage.getState().task.group),
			groups: _.keys(store.connectionStorage.getState().groups),
		};
    }
	
	componentDidMount() {
		var self = this;
		store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.groups, _.keys(store.connectionStorage.getState().groups)))){
				self.setState({groups: _.clone(_.keys(store.connectionStorage.getState().groups))});
			}
		});
		store.adminpanelStorage.subscribe(function(){
			if(self.state.group !== store.adminpanelStorage.getState().task.group){
				self.setState({group: _.clone(store.adminpanelStorage.getState().task.group)});
			}
		});
	}
	
	onChangeHandler(e){
		var self = this;
		if(e.target.value === ""){
			var _tradeobj = _.clone(store.connectionStorage.getState().groups[self.state.group]);
		} else {
			var _tradeobj = _.clone(store.connectionStorage.getState().groups[e.target.value]);
		}
		store.adminpanelStorage.dispatch({type:'SET_TASK_GROUP', payload: {group: _.clone(e.target.value), tradeobj: _tradeobj}});
	}
	
	render() {
		var self = this;
		var AdminIoCommanderPanelBodyMiddleGroupsSet = new Array;
		AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value="">Выберите группу (не обязательно)</option>);
		for(var keyGroup in store.connectionStorage.getState().groups){
			AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value={keyGroup} selected={(self.state.group === keyGroup)?true:false}>{keyGroup}</option>);
		}
		var AdminIoCommanderPanelBodyMiddleGroups = <p><select size="1" onChange={self.onChangeHandler.bind(this)}> {AdminIoCommanderPanelBodyMiddleGroupsSet} </select></p>;
		return (
			<div><div className="DelphiForm1Name"> Объекты:</div> {AdminIoCommanderPanelBodyMiddleGroups}<br /></div>
		);
	}
	
}

module.exports = group;