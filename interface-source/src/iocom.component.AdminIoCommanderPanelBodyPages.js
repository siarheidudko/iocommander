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

var AdminIoCommanderPanelBodyPage = {};
import AdminIoCommanderPanelBodyPage1 from './iocom.component.AdminIoCommanderPanelBodyPage.js'; 
AdminIoCommanderPanelBodyPage.adm_setTask = AdminIoCommanderPanelBodyPage1;
import AdminIoCommanderPanelBodyPage2 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_setUser = AdminIoCommanderPanelBodyPage2;
import AdminIoCommanderPanelBodyPage3 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_delUser = AdminIoCommanderPanelBodyPage3;
import AdminIoCommanderPanelBodyPage4 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_setAdmin = AdminIoCommanderPanelBodyPage4;
import AdminIoCommanderPanelBodyPage5 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_delAdmin = AdminIoCommanderPanelBodyPage5;
import AdminIoCommanderPanelBodyPage6 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_TaskReport = AdminIoCommanderPanelBodyPage6;
import AdminIoCommanderPanelBodyPage7 from './iocom.component.AdminIoCommanderPanelBodyPage.js';
AdminIoCommanderPanelBodyPage.adm_TaskOnline = AdminIoCommanderPanelBodyPage7;

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
		store.adminpanelStorage.subscribe(function(){
			if(self.state.page !== store.adminpanelStorage.getState().page){
				self.setState({page: _.clone(store.adminpanelStorage.getState().page)});
			}
		});
	}
	
	render() {
		window.console.log('Обновлен компонент AdminIoCommanderPanelBodyPages');
		return (
			<{AdminIoCommanderPanelBodyPage[this.state.page]} test={this.state.page} />
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPages;