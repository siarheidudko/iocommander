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

class AdminIoCommanderPanelHeader extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			version: _.clone(store.connectionStorage.getState().version)
		}
    }
	
	componentDidMount() {
		var self = this;
		store.connectionStorage.subscribe(function(){
			if(self.state.version !== store.connectionStorage.getState().version){
				self.setState({version: _.clone(store.connectionStorage.getState().version)});
			}
		});
	}
	
	render() {
		return (
			<div className="AdminIoCommanderPanelHeader">
				<h2> Администрирование IoCommander {(this.state.version !== '')?('v' + this.state.version):''} </h2>
				<head><title>Администрирование IoCommander {(this.state.version !== '')?('v' + this.state.version):''}</title></head>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelHeader;