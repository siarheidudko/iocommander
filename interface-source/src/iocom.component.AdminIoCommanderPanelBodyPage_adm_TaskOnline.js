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

class AdminIoCommanderPanelBodyPage_adm_TaskReport extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			usersAll: _.clone(store.serverStorage.getState().users),
			usersOnline: _.clone(store.connectionStorage.getState().users),
			versions: _.clone(store.connectionStorage.getState().versions),
		};
    }
 
 	componentDidMount() {
	    var self = this;
		var cancel1 = store.connectionStorage.subscribe(function(){
			if((!(_.isEqual(self.state.usersOnline, store.connectionStorage.getState().users)) || !(_.isEqual(self.state.versions, store.connectionStorage.getState().versions)))&& (store.adminpanelStorage.getState().page === 'adm_TaskOnline')){
				self.setState({usersOnline: _.clone(store.connectionStorage.getState().users), versions:  _.clone(store.connectionStorage.getState().versions)});
			}
		});
		var cancel2 = store.serverStorage.subscribe(function(){
			if(!(_.isEqual(self.state.usersAll, store.serverStorage.getState().users)) && (store.adminpanelStorage.getState().page === 'adm_TaskOnline')){
				self.setState({usersAll: _.clone(store.serverStorage.getState().users)});
			}
		});
		this.componentWillUnmount = function(){cancel1(); cancel2();};
	}
	
	onChangeHandler(e){
		this.setState({SelectReport: e.target.value});
	}
	
	render() {

		var adm_OnlineOn = new Array; 
		var adm_OnlineOff = new Array; 
		for(var keyOnlineAll in this.state.usersAll){
			if(typeof(store.connectionStorage.getState().users[keyOnlineAll]) !== 'undefined'){
				adm_OnlineOn.push(<div key={core.generateUID()} className={"adm_OnlineOn0"}><div>{core.replacer(keyOnlineAll, false)}</div><div className={(store.connectionStorage.getState().versions[keyOnlineAll] !== store.connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(store.connectionStorage.getState().versions[keyOnlineAll]) === 'string')?store.connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
			} else {
				adm_OnlineOff.push(<div key={core.generateUID()} className={"adm_OnlineOff0"}><div>{core.replacer(keyOnlineAll, false)}</div><div className={(store.connectionStorage.getState().versions[keyOnlineAll] !== store.connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(store.connectionStorage.getState().versions[keyOnlineAll]) === 'string')?store.connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
			}
		}
		
		return ( 
			<div className="reportOnline"> {(adm_OnlineOn.length !== 0)?<div className="adm_OnlineOn">{adm_OnlineOn}</div>:''} {(adm_OnlineOff.length !== 0)?<div className="adm_OnlineOff">{adm_OnlineOff}</div>:''}</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_TaskReport;