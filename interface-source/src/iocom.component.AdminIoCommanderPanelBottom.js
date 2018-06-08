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

import AdminIoCommanderPanelBottomRight from './iocom.component.AdminIoCommanderPanelBottomRight.js';
import AdminIoCommanderPanelBottomLeft from './iocom.component.AdminIoCommanderPanelBottomLeft.js';

"use strict"

class AdminIoCommanderPanelBottom extends React.Component{
	
	render() {
		return (
			<div className="AdminIoCommanderPanelBottom">
				<AdminIoCommanderPanelBottomLeft />
				<AdminIoCommanderPanelBottomRight />
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBottom;