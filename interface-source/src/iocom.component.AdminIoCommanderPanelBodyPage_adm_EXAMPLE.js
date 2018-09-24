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

class AdminIoCommanderPanelBodyPage_adm_EXAMPLE extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
		};
    }
 
 	componentDidMount() {
	    var self = this;
		store.connectionStorage.subscribe(function(){
			if((true) && (store.adminpanelStorage.getState().page === 'adm_EXAMPLE')){
				///
			}
		});
	}
	
	componentWillUnmount() {
		this.componentDidMount = function(){};
	}
	
	render() {

		return ( 
			<div></div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_EXAMPLE;