 /**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import React from 'react';

var store = require('./iocom.store.js');
import core from './iocom.core.js';

import AdminIoCommanderPanelPopup from './iocom.component.AdminIoCommanderPanelPopup.js';
import AdminIoCommanderPanelHeader from './iocom.component.AdminIoCommanderPanelHeader.js';
import AdminIoCommanderPanelBottom from './iocom.component.AdminIoCommanderPanelBottom.js';
import AdminIoCommanderPanelAuth from './iocom.component.AdminIoCommanderPanelAuth.js';
import AdminIoCommanderPanelBody from './iocom.component.AdminIoCommanderPanelBody.js';

"use strict"

class AdminIoCommanderPanel extends React.Component{
  
    constructor(props, context){
		super(props, context);
		this.state = {
			auth: _.clone(store.adminpanelStorage.getState().auth)
		};
    }
      
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(!(_.isEqual(self.state.auth, store.adminpanelStorage.getState().auth))){
				self.setState({auth: _.clone(store.adminpanelStorage.getState().auth)});
			}
		});
	}
      
  	render() {
		return (
			<div className="AdminIoCommanderPanel">
				<AdminIoCommanderPanelHeader />
				<AdminIoCommanderPanelPopup />
				{(this.state.auth)?<AdminIoCommanderPanelBody />:<AdminIoCommanderPanelAuth />}
				<AdminIoCommanderPanelBottom />
			</div>
		);
	}
};

module.exports = AdminIoCommanderPanel;