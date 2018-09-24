/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import React from 'react';
import ReactDOM from 'react-dom';

var store = require('./iocom.store.js');
import core from './iocom.core.js';

import AdminIoCommanderPanel from './iocom.component.AdminIoCommanderPanel.js';

"use strict"

ReactDOM.render(
	<AdminIoCommanderPanel />,
	document.getElementById('AdminIoCommander')
);