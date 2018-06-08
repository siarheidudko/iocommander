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

class AdminIoCommanderPanelBottomRight extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			OnlineUsers: _.clone(store.connectionStorage.getState().users),
			clientUsers: _.clone(store.serverStorage.getState().users), //нужны для обновления компонента при добавлении/удалении юзеров
			adminUsers: _.clone(store.serverStorage.getState().admins)
		};
    }
	
	componentDidMount() {
		var self = this;
		var showingTooltip;
		self.showingTooltip = showingTooltip;
		store.serverStorage.subscribe(function(){
			if(!(_.isEqual(self.state.clientUsers, store.adminpanelStorage.getState().users)) || !(_.isEqual(self.state.adminUsers, store.adminpanelStorage.getState().admins))){
				self.setState({clientUsers: _.clone(store.serverStorage.getState().users), adminUsers: _.clone(store.serverStorage.getState().admins)});
			}
		});
		store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.OnlineUsers, store.connectionStorage.getState().users))){
				self.setState({OnlineUsers: _.clone(store.connectionStorage.getState().users)});
			}
		});
	}
	
	MouseOver(e) {
		var self = this;
		var target = e.target;
		if(target.getAttribute('data-tooltip') !== null){
			let temp = target.getAttribute('data-tooltip').toString();
			let temparr = temp.split(',');
			let temparrnew = new Array;
			for(let i = 0; i < temparr.length; i = i + 6){
				let tempstring;
				for(let j = i; j < i + 6; j++){
					if(typeof(temparr[j]) !== 'undefined'){
						if(j === i){ 
							tempstring = '<div class="tooltipTCol' + (j % 6) + '">' + temparr[j].toString() + '</div>';
						} else {
							tempstring = tempstring + '<div class="tooltipTCol' + (j % 6) + '">' + temparr[j].toString() + '</div>';
						}
					}
				}
				temparrnew.push(tempstring);
			}
			let tempstringnew = '';
			for(let i = 0; i < temparrnew.length; i++){
				tempstringnew = tempstringnew + '<div class="tooltipTLine">' + temparrnew[i] + '</div>';
			}
			//var tooltip = temp.replace(/\,/gi,"<br>"); //старый вариант в виде столбца
			var tooltip =tempstringnew;
			if (!tooltip) return;

			var tooltipElem = document.createElement('div');
			tooltipElem.className = 'tooltip';
			tooltipElem.innerHTML = tooltip;
			document.body.appendChild(tooltipElem);

			var coords = target.getBoundingClientRect();
			var left = coords.left - tooltipElem.offsetWidth + target.offsetWidth;
			if (left < 0) left = 0; // не вылезать за левую границу окна

			var top = coords.top - tooltipElem.offsetHeight - 5;
			if (top < 0) { // не вылезать за верхнюю границу окна
				top = coords.top + target.offsetHeight + 5;
			}

			tooltipElem.style.left = left + 'px';
			tooltipElem.style.top = top + 'px';

			self.showingTooltip = tooltipElem;
		}
	}
	
	MouseOut(e) {
		var self = this;
		if (self.showingTooltip) {
			document.body.removeChild(self.showingTooltip);
			self.showingTooltip = null;
		} 
	}
	
	render() {
		var AdminIoCommanderPanelBottomUsersOnline = new Array,
		AdminIoCommanderPanelBottomUsersOffline = new Array;
		for(var OnlineUser in this.state.OnlineUsers) {
			AdminIoCommanderPanelBottomUsersOnline.push(core.replacer(OnlineUser, false));
		}
		for(var OfflineUser in _.clone(store.serverStorage.getState().users)) {
			if(AdminIoCommanderPanelBottomUsersOnline.indexOf(core.replacer(OfflineUser, false)) === -1){
				AdminIoCommanderPanelBottomUsersOffline.push(core.replacer(OfflineUser, false));
			}
		}
	/*	админов вывожу только в онлайн. так удобнее мониторить пользователей.
		for(var OfflineUser in _.clone(store.serverStorage.getState().admins)) {
			if(AdminIoCommanderPanelBottomUsersOnline.indexOf(core.replacer(OfflineUser, false)) === -1){
				AdminIoCommanderPanelBottomUsersOffline.push(core.replacer(OfflineUser, false));
			}
		} */
		return (
			<div>
				<div className="AdminIoCommanderPanelBottomUsersOnline" data-tooltip={AdminIoCommanderPanelBottomUsersOnline} onMouseOver={this.MouseOver.bind(this)} onMouseOut={this.MouseOut.bind(this)}>
					<div>{'Online: ' + AdminIoCommanderPanelBottomUsersOnline.length}</div>
				</div>
				<div className="AdminIoCommanderPanelBottomUsersOffline" data-tooltip={AdminIoCommanderPanelBottomUsersOffline} onMouseOver={this.MouseOver.bind(this)} onMouseOut={this.MouseOut.bind(this)}>
					<div>{'Offline: ' + AdminIoCommanderPanelBottomUsersOffline.length}</div>
				</div>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBottomRight;