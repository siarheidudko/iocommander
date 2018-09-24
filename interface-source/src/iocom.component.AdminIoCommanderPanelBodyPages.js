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

import AdminIoCommanderPanelBodyPage_adm_setTask from './iocom.component.AdminIoCommanderPanelBodyPage_adm_setTask.js'; 
import AdminIoCommanderPanelBodyPage_adm_setUser from './iocom.component.AdminIoCommanderPanelBodyPage_adm_setUser.js';
import AdminIoCommanderPanelBodyPage_adm_setAdmin from './iocom.component.AdminIoCommanderPanelBodyPage_adm_setAdmin.js';
import AdminIoCommanderPanelBodyPage_adm_delUser from './iocom.component.AdminIoCommanderPanelBodyPage_adm_delUser.js';
import AdminIoCommanderPanelBodyPage_adm_delAdmin from './iocom.component.AdminIoCommanderPanelBodyPage_adm_delAdmin.js';
import AdminIoCommanderPanelBodyPage_adm_TaskReport from './iocom.component.AdminIoCommanderPanelBodyPage_adm_TaskReport.js';
import AdminIoCommanderPanelBodyPage_adm_TaskOnline from './iocom.component.AdminIoCommanderPanelBodyPage_adm_TaskOnline.js';

"use strict"

class AdminIoCommanderPanelBodyPages extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			page: _.clone(store.adminpanelStorage.getState().page)
		};
    }
 
 	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.page !== store.adminpanelStorage.getState().page){
				self.setState({page: _.clone(store.adminpanelStorage.getState().page)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	render() {
		
		var selected = '<div> Undefined page </div>';
		switch(this.state.page){
			case 'adm_setTask':
				selected = <AdminIoCommanderPanelBodyPage_adm_setTask />;
				break;
			case 'adm_setUser':
				selected = <AdminIoCommanderPanelBodyPage_adm_setUser />;
				break;
			case 'adm_delUser':
				selected = <AdminIoCommanderPanelBodyPage_adm_delUser />;
				break;
			case 'adm_setAdmin':
				selected = <AdminIoCommanderPanelBodyPage_adm_setAdmin />;
				break;
			case 'adm_delAdmin':
				selected = <AdminIoCommanderPanelBodyPage_adm_delAdmin />;
				break;
			case 'adm_TaskReport':
				selected = <AdminIoCommanderPanelBodyPage_adm_TaskReport />;
				break;
			case 'adm_TaskOnline':
				selected = <AdminIoCommanderPanelBodyPage_adm_TaskOnline />;
				break;
		}
		
		return (
			<div className="PanelBodyMargin">
				<center>
					{selected}
				</center>
			</div>
		)
	}
	
}

module.exports = AdminIoCommanderPanelBodyPages;