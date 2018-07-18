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

class AdminIoCommanderPanelBodyPage_adm_TaskReport extends React.Component{
	
	constructor(props, context){
		super(props, context);
		this.state = {
			SelectReport: "",
			report: _.clone(store.connectionStorage.getState().report)
		};
    }
 
 	componentDidMount() {
	    var self = this;
		store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.report, store.connectionStorage.getState().report)) && (store.adminpanelStorage.getState().page === 'adm_TaskReport')){
				self.setState({report: _.clone(store.connectionStorage.getState().report)});
			}
		});
	}
	
	onChangeHandler(e){
		this.setState({SelectReport: e.target.value});
	}
	
	render() {

		var adm_TaskReportOption = new Array;
		adm_TaskReportOption.push(<option value="">Выберите задачу</option>);
		for(var keyTask in this.state.report){ 
			var dateEpochToString = new Date(this.state.report[keyTask].datetime);
			adm_TaskReportOption.push(<option value={keyTask} selected={(this.state.SelectReport === keyTask)?true:false} >{core.timeStamp(dateEpochToString) + '_' + this.state.report[keyTask].comment}</option>);
		}
		var adm_TaskReport = <p><select size="1" name="SetSelectReport" onChange={this.onChangeHandler.bind(this)}> + {adm_TaskReportOption} + </select></p>; 
		var adm_TaskReportResult = new Array;
		if(this.state.SelectReport !== ""){
			var tempStorage = this.state.report;
			var reportTaskCOMPLETE = '',
				reportTaskERRORS = '',
				reportTaskTEXT = '',
				reportTaskDEPEN = '';
			if(tempStorage[this.state.SelectReport].incomplete.length > 0) {
				reportTaskCOMPLETE = <div className="textRED" id="blink1"> Есть невыполненные задания! </div>;
			} else if (tempStorage[this.state.SelectReport].errors === 0) {
				reportTaskCOMPLETE = <div className="textGREEN" id="blink1"> Все задания выполнены! </div>;
			}
			if(tempStorage[this.state.SelectReport].errors > 0) {
				reportTaskERRORS = <div className="textRED" id="blink2"> Есть ошибки выполнения! </div>;
			}
			var reportTaskUID = <div> UID: {this.state.SelectReport} </div>;
			if((typeof(tempStorage[this.state.SelectReport].text) === 'string') && (tempStorage[this.state.SelectReport].text !== '')){
				reportTaskTEXT = <div> {tempStorage[this.state.SelectReport].text} </div>;
			}
			if((typeof(tempStorage[this.state.SelectReport].dependencies) === 'string') && (tempStorage[this.state.SelectReport].dependencies !== '')){
				reportTaskDEPEN = <div> Зависимости: {tempStorage[this.state.SelectReport].dependencies} </div>;
			}
			adm_TaskReportResult.push(<div className={'reportTableRow'}> {reportTaskUID} {reportTaskCOMPLETE} {reportTaskERRORS} {reportTaskTEXT} {reportTaskDEPEN}  <br /> </div>)
			if(typeof(tempStorage[this.state.SelectReport]) !== 'undefined'){
				var tempObjects = tempStorage[this.state.SelectReport].objects;
				if(typeof(tempObjects) !== 'undefined'){
					var adm_TaskReportResultRow = new Array;
					adm_TaskReportResultRow.push(<div className="reportTableColumnName">Учетная запись</div>);
					adm_TaskReportResultRow.push(<div className="reportTableColumnStatus">Статус выполнения</div>);
					adm_TaskReportResultRow.push(<div className="reportTableColumnAnswer">Вывод (ответ) консоли</div>);
					adm_TaskReportResultRow.push(<div className="reportTableColumnDate">Дата создания</div>);
					adm_TaskReportResultRow.push(<div className="reportTableColumndatetimeout">Выполнять после</div>);
					adm_TaskReportResultRow.push(<div className="reportTableColumnDateCompl">Дата выполнения</div>);
					adm_TaskReportResult.push(<div className="reportTableRow reportTableRowHeader">{adm_TaskReportResultRow}</div>);
					adm_TaskReportResultRow = null;
					for(var keyObject in tempObjects){
						var adm_TaskReportResultRow = new Array;
						adm_TaskReportResultRow.push(<div className="reportTableColumnName">{keyObject}</div>);
						adm_TaskReportResultRow.push(<div className="reportTableColumnStatus">{((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'Выполнено':'Не выполнено'}</div>);
						adm_TaskReportResultRow.push(<div className="reportTableColumnAnswer">{(tempObjects[keyObject].answer === 'none')?'':tempObjects[keyObject].answer.split('\n').map( (it, i) => <div key={'x'+i}>{it}</div> )}</div>);
						var dateEpochToString = new Date(tempObjects[keyObject].datetime);
						adm_TaskReportResultRow.push(<div className="reportTableColumnDate">{core.timeStamp(dateEpochToString)}</div>);
						if((tempObjects[keyObject].datetimeout !== 0) && (typeof(tempObjects[keyObject].datetimeout) !== 'undefined')){
							var dateEpochToStringTimeout = new Date(tempObjects[keyObject].datetimeout);
						} else {
							var dateEpochToStringTimeout = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
						}
						adm_TaskReportResultRow.push(<div className="reportTableColumndatetimeout">{core.timeStamp(dateEpochToStringTimeout)}</div>);
						if(tempObjects[keyObject].datetimecompl !== 0){
							var dateEpochToStringCompl = new Date(tempObjects[keyObject].datetimecompl);
						} else {
							var dateEpochToStringCompl = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
						}
						adm_TaskReportResultRow.push(<div className="reportTableColumnDateCompl">{core.timeStamp(dateEpochToStringCompl)}</div>);								
						adm_TaskReportResult.push(<div className={'reportTableRow reportTableRow'+(((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'true':'false')}>{adm_TaskReportResultRow}</div>);
					}
				}
			}
		}

		return ( 
			<div> {adm_TaskReport} <div className="reportTable">{adm_TaskReportResult}</div></div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage_adm_TaskReport;