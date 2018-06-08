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

class AdminIoCommanderPanelBottomLeft extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			memory: '',
			cpu: ''
		};
    }
	
	componentDidMount() {
		var self = this;
		store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.OnlineUsers, store.connectionStorage.getState().users))){
				self.setState({memory: _.clone(store.connectionStorage.getState().memory), cpu: _.clone(store.connectionStorage.getState().cpu)});
			}
		});
	}
	
	render() {
		return (
			<div className="AdminIoCommanderPanelBottomServerStat">
				<div>{this.state.memory}</div>
				<div>{this.state.cpu}</div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBottomLeft;