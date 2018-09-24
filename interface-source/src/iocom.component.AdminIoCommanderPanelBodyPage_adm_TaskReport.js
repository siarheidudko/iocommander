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
		var cancel = store.connectionStorage.subscribe(function(){
			if(!(_.isEqual(self.state.report, store.connectionStorage.getState().report)) && (store.adminpanelStorage.getState().page === 'adm_TaskReport')){
				self.setState({report: _.clone(store.connectionStorage.getState().report)});
			}
		});
		this.componentWillUnmount = cancel;
	}
	
	onChangeHandler(e){
		this.setState({SelectReport: e.target.value});
	}
	
	onBtnClickHandler(e){
		var file = core.jsonReportToCSV(this.state.SelectReport);
		if(file !== 'error'){
			try{
				core.FileSaver.saveAs(file);
				core.popup('Выполнено!');
			} catch(err){
				console.log(err);
				core.popup('Не могу сохранить файл!');
			}
		} else {
			core.popup('Ошибка преобразования!');
		}
	}
	
	render() {

		var adm_TaskReportOption = new Array;
		adm_TaskReportOption.push(<option key={core.generateUID()} value="">Выберите задачу</option>);
		for(var keyTask in this.state.report){ 
			var dateEpochToString = new Date(this.state.report[keyTask].datetime);
			adm_TaskReportOption.push(<option key={core.generateUID()} value={keyTask} >{core.timeStamp(dateEpochToString) + '_' + this.state.report[keyTask].comment}</option>);
		}
		var adm_TaskReport = <p><select size="1" name="SetSelectReport" onChange={this.onChangeHandler.bind(this)} value={this.state.SelectReport}> + {adm_TaskReportOption} + </select></p>; 
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
			var reportTaskUID = <div> UID: {this.state.SelectReport}&#8195;<button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Скачать</button></div>;
			if((typeof(tempStorage[this.state.SelectReport].text) === 'string') && (tempStorage[this.state.SelectReport].text !== '')){
				reportTaskTEXT = <div> {tempStorage[this.state.SelectReport].text} </div>;
			}
			if((typeof(tempStorage[this.state.SelectReport].dependencies) === 'string') && (tempStorage[this.state.SelectReport].dependencies !== '')){
				reportTaskDEPEN = <div> Зависимости: {tempStorage[this.state.SelectReport].dependencies} </div>;
			}
			adm_TaskReportResult.push(<div key={core.generateUID()} className={'reportTableRow'}> {reportTaskUID} {reportTaskCOMPLETE} {reportTaskERRORS} {reportTaskTEXT} {reportTaskDEPEN}  <br /> </div>)
			if(typeof(tempStorage[this.state.SelectReport]) !== 'undefined'){
				var tempObjects = tempStorage[this.state.SelectReport].objects;
				if(typeof(tempObjects) !== 'undefined'){
					var adm_TaskReportResultRow = new Array;
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnName">Учетная запись</div>);
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnStatus">Статус выполнения</div>);
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnAnswer">Вывод (ответ) консоли</div>);
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnDate">Дата создания</div>);
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumndatetimeout">Выполнять после</div>);
					adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnDateCompl">Дата выполнения</div>);
					adm_TaskReportResult.push(<div key={core.generateUID()} className="reportTableRow reportTableRowHeader">{adm_TaskReportResultRow}</div>);
					adm_TaskReportResultRow = null;
					for(var keyObject in tempObjects){
						var adm_TaskReportResultRow = new Array;
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnName">{core.replacer(keyObject, false)}</div>);
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnStatus">{((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'Выполнено':'Не выполнено'}</div>);
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnAnswer">{(tempObjects[keyObject].answer === 'none')?'':tempObjects[keyObject].answer.split('\n').map( (it, i) => <div key={'x'+i}>{it}</div> )}</div>);
						var dateEpochToString = new Date(tempObjects[keyObject].datetime);
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnDate">{core.timeStamp(dateEpochToString)}</div>);
						if((tempObjects[keyObject].datetimeout !== 0) && (typeof(tempObjects[keyObject].datetimeout) !== 'undefined')){
							var dateEpochToStringTimeout = new Date(tempObjects[keyObject].datetimeout);
						} else {
							var dateEpochToStringTimeout = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
						}
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumndatetimeout">{core.timeStamp(dateEpochToStringTimeout)}</div>);
						if(tempObjects[keyObject].datetimecompl !== 0){
							var dateEpochToStringCompl = new Date(tempObjects[keyObject].datetimecompl);
						} else {
							var dateEpochToStringCompl = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
						}
						adm_TaskReportResultRow.push(<div key={core.generateUID()} className="reportTableColumnDateCompl">{core.timeStamp(dateEpochToStringCompl)}</div>);								
						adm_TaskReportResult.push(<div key={core.generateUID()} className={'reportTableRow reportTableRow'+(((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'true':'false')}>{adm_TaskReportResultRow}</div>);
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