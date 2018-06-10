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

import AdminIoCommanderPanelBodyHeader from './iocom.component.AdminIoCommanderPanelBodyHeader.js';
import AdminIoCommanderPanelBodyPages from './iocom.component.AdminIoCommanderPanelBodyPages.js';

"use strict"

class AdminIoCommanderPanelBody extends React.Component{
 
	render() {
		window.console.log('Обновлен компонент AdminIoCommanderPanelBody');
		return (
			<div className="AdminIoCommanderPanelBody">
				<AdminIoCommanderPanelBodyHeader />
				<AdminIoCommanderPanelBodyPages />
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBody;