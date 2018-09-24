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

import Moment from 'moment'
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

"use strict"

Moment.locale('ru');
momentLocalizer();

class time extends React.Component{
   
	constructor(props, context){
		super(props, context);
		this.state = {
			time: _.clone(store.adminpanelStorage.getState().task.time)
		};
    }
	
	componentDidMount() {
		var self = this;
		var cancel = store.adminpanelStorage.subscribe(function(){
			if(self.state.time !== store.adminpanelStorage.getState().task.time){
				self.setState({time: _.clone(store.adminpanelStorage.getState().task.time)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		store.adminpanelStorage.dispatch({type:'SET_TASK_TIME', payload: {time: _.clone(e.getTime())}});
	}
	
	render() {
		return (
			<div className="inputFieldCenterRight DateTimePickerTable">
				<DateTimePicker containerClassName="DateTimePickerRight" defaultValue={new Date(this.state.time)} onChange={value => this.onChangeHandler(value)} />
				<div className="DateTimePickerLeft">Выполнить после: </div> 
			</div>
		);
	}
	
}

module.exports = time;