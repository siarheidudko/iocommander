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

class file extends React.Component{
  
	constructor(props, context){
		super(props, context);
    }
	
	onChangeHandler(e){
		window.files = this.refs.FileUploadToServer.files;
	}
	
	render() { console.log('file');
		return (
			<div className="inputFieldCenterRight">Файл: <input type="file" ref="FileUploadToServer" onChange={this.onChangeHandler.bind(this)} /></div>
		);
	}
	
}

module.exports = file;