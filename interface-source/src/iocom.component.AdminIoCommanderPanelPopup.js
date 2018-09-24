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

class AdminIoCommanderPanelPopup extends React.Component{
  
	constructor(props, context) {
		super(props, context);
		this.state = {
			PopupText: _.clone(store.adminpanelStorage.getState().popuptext),
		};
		this.onDivClickHandler = this.onDivClickHandler.bind(this);
	}
      
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.PopupText !== store.adminpanelStorage.getState().popuptext){
				self.setState({PopupText: _.clone(store.adminpanelStorage.getState().popuptext)});
				if(store.adminpanelStorage.getState().popuptext !== ''){
					setTimeout(core.popup, 2000, '');
				}
			}
		});
		this.componentWillUnmount = cancel;
	}
      
  	onDivClickHandler(e) {
		var self = this;
		if(self.state.PopupText !== ''){
			self.setState({PopupText: ''});
		}
	}
      
  	render() {
		return (
			<div className={(this.state.PopupText == "")?"popup unshow":"popup show"} onClick={this.onDivClickHandler}>
				<span className="popuptext" id="myPopup">{this.state.PopupText}</span>
			</div>
		);
	}
};

module.exports = AdminIoCommanderPanelPopup;