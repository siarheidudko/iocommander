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

"use strict"

class AdminIoCommanderPanelBodyPage extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			CommandType: _.clone(store.adminpanelStorage.getState().page),
			ParamOne: core.generateUID(),
			ParamTwo: '',
			ParamThird: '',
			ParamFour: '',
			ParamFive: '',
			ParamSix: '',
			ParamSeven: new Array,
			ParamEight: new Array,
			ParamTen: '',
			ParamEleven: '',
			ParamEleven: false,
		};
    }
	
	componentDidMount() {
		var self = this;
		store.adminpanelStorage.subscribe(function(){
			if(self.state.CommandType !== store.adminpanelStorage.getState().page){
				if(store.adminpanelStorage.getState().page === 'adm_setTask'){
					self.setState({CommandType: _.clone(store.adminpanelStorage.getState().page),ParamOne: core.generateUID(),ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				} else {
					self.setState({CommandType: _.clone(store.adminpanelStorage.getState().page),ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				}
			}
		});
	}
	
	onChangeHandler(e){
		var regexpAll = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		switch(e.target.name){
			case 'SetParamOne':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					this.setState({ParamOne: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamTwo':
				if(this.state.CommandType === 'adm_setTask'){
					this.setState({ParamOne: core.generateUID(),ParamTwo: e.target.value,ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				} else {
					this.setState({ParamTwo: e.target.value});
				}
				break;
			case 'SetParamThird':
				var regexp = new RegExp("^.*[^A-z0-9\. \"\|\(\)\[\^\$\*\+\?\/&_:!<>@-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execCommand')){
					this.setState({ParamThird: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execCommand')) {
					this.setState({ParamThird: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamFour':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamFour: e.target.value.replace(/\\/gi,"/")});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamFive':
				var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execFile')){
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execFile')) {
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamSix':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamSix: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamSeven':
				var regexp = new RegExp("^.*[^A-z0-9;-].*$");
				if(!regexp.test(e.target.value)){
					var ParamSeven = e.target.value.split(';');
					this.setState({ParamSeven: ParamSeven});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamEight':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					var ParamEight = this.state.ParamEight.slice();
					if(e.target.checked){
						ParamEight.push(e.target.value);
						this.setState({ParamEight: ParamEight});
					} else {
						ParamEight.splice(ParamEight.indexOf(e.target.value), 1);
						this.setState({ParamEight: ParamEight});
					}
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamNine':
				var regexp = new RegExp("^.*[^A-z0-9А-я ].*$");
				if(!regexp.test(e.target.value)){
					this.setState({ParamNine: e.target.value});
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamTen':
				var regexp = new RegExp("^.*[^0-9T:-].*$");
				if(!regexp.test(e.target.value)){
					//2018-03-19T18:37:00
					switch(e.target.value.length){
						case 4:
							this.setState({ParamTen: e.target.value + '-'});
							break;
						case 7:
							this.setState({ParamTen: e.target.value + '-'});
							break;
						case 10:
							this.setState({ParamTen: e.target.value + 'T'});
							break;
						case 13:
							this.setState({ParamTen: e.target.value + ':'});
							break;
						case 16:
							this.setState({ParamTen: e.target.value + ':'});
							break;
						default:
							if(e.target.value.length < 20){
								this.setState({ParamTen: e.target.value});
							}
							break;
					}
				} else {
					core.popup('Некорректный символ!');
				}
				break;
			case 'SetParamEleven':
				if(e.target.value !== ""){
					var tempArr = _.clone(store.connectionStorage.getState().groups[e.target.value]);
					var tempNewArr = _.clone(this.state.ParamEight);
					for(var i =0; i< tempArr.length;i++){
						if(tempNewArr.indexOf(tempArr[i]) === -1){
							tempNewArr.push(tempArr[i]);
						}
					}
					this.setState({ParamEight: tempNewArr,ParamEleven: e.target.value});
				} else {
					var tempArr = _.clone(store.connectionStorage.getState().groups[this.state.ParamEleven]);
					var tempNewArr = _.clone(this.state.ParamEight);
					for(var i =0; i< tempArr.length;i++){
						if(tempNewArr.indexOf(tempArr[i]) !== -1){
							tempNewArr.splice(tempNewArr.indexOf(tempArr[i]), 1);
						}
					}
					this.setState({ParamEight: tempNewArr,ParamEleven: e.target.value});
				}
				break;
			case 'SetParamTwelve':
				this.setState({ParamTwelve: e.target.checked});
				break;
			default:
				break;
		}
	}
	
	onBtnClickHandler(e){
		if(e.target.id === 'submit'){
			if(typeof(window.socket) !== 'undefined'){
				switch(this.state.CommandType){
					case 'adm_setTask':
						var onSetTask = false;
						if((typeof(this.state.ParamOne) === 'string') && (this.state.ParamOne !== '') && (typeof(this.state.ParamTwo) === 'string') && (this.state.ParamTwo !== '') && (typeof(this.state.ParamSix) === 'string') && (this.state.ParamSix !== '') && (typeof(this.state.ParamSeven) === 'object') && (typeof(this.state.ParamEight) === 'object')){
							var timeOnCompl;
							try {
								timeOnCompl = new Date(this.state.ParamTen);
							} catch(e){
								timeOnCompl = new Date(0);
							}
							switch(this.state.ParamTwo){
								case 'getFileFromWWW':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '') && (typeof(this.state.ParamFive) === 'string') && (this.state.ParamFive !== '')){
											if((typeof(this.state.ParamFour) !== 'string') || (this.state.ParamFour === '')){
												var intLinkReal = '/tmp/iocom/';
											} else {
												var intLinkReal = this.state.ParamFour;
											}
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, extLink:this.state.ParamThird, intLink:intLinkReal, fileName: this.state.ParamFive, exec:this.state.ParamTwelve.toString(), platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											window.console.log("Некорректные аргументы!");
											core.popup("Некорректные аргументы!");
										}
									break;
								case 'execFile':
										if((typeof(this.state.ParamThird) === 'string') && (typeof(this.state.ParamFour) === 'string') && (this.state.ParamFour !== '') && (typeof(this.state.ParamFive) === 'string')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, intLink:this.state.ParamThird, fileName: this.state.ParamFour, paramArray:this.state.ParamFive.split(" "), platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											window.console.log("Некорректные аргументы!");
											core.popup("Некорректные аргументы!");
										}
									break;
								case 'execCommand':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, execCommand:this.state.ParamThird, platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											window.console.log("Некорректные аргументы!");
											core.popup("Некорректные аргументы!");
										}
									break;
								case 'getFileFromFileserver':
										if((typeof(this.refs.FileUploadToServer.files) === 'object') && (this.refs.FileUploadToServer.files.length === 1)){ //длинна массива файлов =1, если выбран один файл
											if((typeof(this.state.ParamFour) !== 'string') || (this.state.ParamFour === '')){
												var intLinkReal = '/tmp/iocom/';
											} else {
												var intLinkReal = this.state.ParamFour;
											}
											core.SendFileToInternalFS(this.refs.FileUploadToServer.files, this.state.ParamOne, intLinkReal, this.state.ParamSix, this.state.ParamSeven, this.state.ParamNine, timeOnCompl, this.state.ParamEight, this.state.ParamTwelve.toString());
										} else {
											window.console.log("Некорректные аргументы!");
											core.popup("Некорректные аргументы!");	
										}
										onSetTask = true; //чистим поля
									break;
							}
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						if((onSetTask) && (this.state.ParamEight.length > 0)){
							if(this.state.ParamTwo !== 'getFileFromFileserver'){
								for(var i=0;i<this.state.ParamEight.length;i++){
									var EmitMessage = new Array(this.state.ParamEight[i], tempTask);
									window.socket.emit('adm_setTask', EmitMessage);
								}
							}
							this.setState({ParamOne: core.generateUID(),ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else{
							window.console.log("Проблема генерации задачи!");
							//core.popup("Проблема генерации задачи!");
						}
						break;
					case 'adm_setUser':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
					case 'adm_setAdmin':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setAdmin', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
					case 'adm_delUser':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delUser', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
					case 'adm_delAdmin':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
					case 'adm_TaskReport':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
					case 'adm_TaskOnline':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							window.console.log("Некорректные аргументы!");
							core.popup("Некорректные аргументы!");
						}
						break;
				}
			} else {
				window.console.log("Сокет недоступен!");
				core.popup("Сокет недоступен!");
			}
		}
	}
	
	render() {
		window.console.log('Обновлен компонент AdminIoCommanderPanelBodyPage');
		
		var AdminIoCommanderPanelBodyMiddle = new Array;
		switch (this.state.CommandType){
			case 'adm_setTask':
				//поле с uid таска (только чтение)
				AdminIoCommanderPanelBodyMiddle.push(<div>UID: {this.state.ParamOne}</div>);
				//выпадающий список типов заданий
				var adm_setTaskOption = new Array;
				adm_setTaskOption.push(<option value="">Выберите тип задания</option>);
				adm_setTaskOption.push(<option value="getFileFromWWW" selected={(this.state.ParamTwo === 'getFileFromWWW')?true:false}>Скачать файл по ссылке</option>);
				adm_setTaskOption.push(<option value="getFileFromFileserver" selected={(this.state.ParamTwo === 'getFileFromFileserver')?true:false}>Передать файл</option>);
				adm_setTaskOption.push(<option value="execFile" selected={(this.state.ParamTwo === 'execFile')?true:false}>Запустить локальный скрипт</option>);
				adm_setTaskOption.push(<option value="execCommand" selected={(this.state.ParamTwo === 'execCommand')?true:false}>Выполнить команду</option>);
				var adm_setTask = <p><select size="1" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOption} </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTask} </div>);
				if(this.state.ParamTwo !== ''){
					//Комментарий к таску
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Комментарий (для поиска): <input type="text" name="SetParamNine" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamNine} /></div>);
					//Выполнить после
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Выполнить после (2018-03-19T18:37:00): <input type="text" name="SetParamTen" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTen} /></div>);
					
				}
				switch(this.state.ParamTwo){
					case 'getFileFromWWW':
						//поле ввода ссылки для скачки
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Ссылка для скачки: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						//поле ввода локального пути для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Локальный путь: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода имени файла для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Имя файла: <input type="text" name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						//запустить ли переданный файл (используются переменные окружения)
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Запустить: <input type="checkbox" name="SetParamTwelve" onChange={this.onChangeHandler.bind(this)} checked={this.state.ParamTwelve} /></div>);
						break;
					case 'execFile':
						//поле ввода пути к скрипту
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Путь к скрипту: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						//поле ввода имени скрипта
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Имя скрипта: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода параметров запуска
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Параметры запуска: <input type="text" name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						break;
					case 'execCommand':
						//поле ввода команды запуска
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Команда: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						break;
					case 'getFileFromFileserver':
						//поле выбора файла для передачи
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Файл: <input type="file" ref="FileUploadToServer" /></div>);
						//поле ввода локального пути для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Локальный путь: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//запустить ли переданный файл (используются переменные окружения)
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Запустить: <input type="checkbox" name="SetParamTwelve" onChange={this.onChangeHandler.bind(this)} checked={this.state.ParamTwelve} /></div>);
						break;
				}
				if(this.state.ParamTwo !== ''){
					//выпадающий список выбора платформы
					var adm_setTaskOptionPlatform = new Array;
					adm_setTaskOptionPlatform.push(<option value="">Выберите платформу</option>);
					adm_setTaskOptionPlatform.push(<option value="all" selected={(this.state.ParamSix === 'all')?true:false}>Любая</option>);
					adm_setTaskOptionPlatform.push(<option value="win32" selected={(this.state.ParamSix === 'win32')?true:false}>Windows</option>);
					adm_setTaskOptionPlatform.push(<option value="linux" selected={(this.state.ParamSix === 'linux')?true:false}>Linux</option>);
					var adm_setTaskOptionPlatformSet = <p><select size="1" name="SetParamSix" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOptionPlatform} </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTaskOptionPlatformSet} </div>);
					//поле ввода зависимостей
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Зависимости (необязательно, через ;): <input type="text" name="SetParamSeven" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamSeven.join(';')} /></div>);
					//флаг выбора объектов
					var AdminIoCommanderPanelBodyMiddleClients = new Array;
					var div_val = 0;
					var tempGroup = '';
					for(var keyUser in store.serverStorage.getState().users){
						var thisGroupArr = keyUser.split('_');
						var thisGroup = thisGroupArr[0];
						if(!((tempGroup === '') || (tempGroup === thisGroup))){
							AdminIoCommanderPanelBodyMiddleClients.push(<div className={'clientObject0'}><br /></div>);
							div_val = 0;
						}
						AdminIoCommanderPanelBodyMiddleClients.push(<div className={'clientObject' + div_val}>{core.replacer(keyUser, false)}: <input type="checkbox" name="SetParamEight" onChange={this.onChangeHandler.bind(this)} value={core.replacer(keyUser, false)} checked={(this.state.ParamEight.indexOf(core.replacer(keyUser, false)) === -1)?false:true} /></div>);
						if(div_val <5){
							div_val++;
						} else {
							div_val = 0;
						}
						tempGroup = thisGroup;
					}
					var AdminIoCommanderPanelBodyMiddleGroupsSet = new Array;
					AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value="">Выберите группу (не обязательно)</option>);
					for(var keyGroup in store.connectionStorage.getState().groups){
						AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value={keyGroup} selected={(this.state.ParamEleven === keyGroup)?true:false}>{keyGroup}</option>);
					}
					var AdminIoCommanderPanelBodyMiddleGroups = <p><select size="1" name="SetParamEleven" onChange={this.onChangeHandler.bind(this)}> {AdminIoCommanderPanelBodyMiddleGroupsSet} </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div>Объекты:<br /> {AdminIoCommanderPanelBodyMiddleGroups}<br /><div className="objectTable">{AdminIoCommanderPanelBodyMiddleClients}</div> </div>);
				}
				break;
			case 'adm_setUser':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Логин: <input type="text" name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Пароль: <input type="text" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_setAdmin':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Логин: <input type="text" name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Пароль: <input type="text" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_delUser':
				//выпадающий список пользователей
				var adm_delUserOption = new Array;
				adm_delUserOption.push(<option value="">Выберите пользователя</option>);
				for(var keyUser in store.serverStorage.getState().users){
					adm_delUserOption.push(<option value={keyUser} selected={(this.state.ParamOne === keyUser)?true:false} >{core.replacer(keyUser, false)}</option>);
				}
				var adm_delUser = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delUserOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delUser} </div>);
				break;
			case 'adm_delAdmin':
				//выпадающий список администраторов
				var adm_delAdminOption = new Array;
				adm_delAdminOption.push(<option value="">Выберите пользователя</option>);
				for(var keyAdmin in store.serverStorage.getState().admins){
					adm_delAdminOption.push(<option value={keyAdmin} selected={(this.state.ParamOne === keyAdmin)?true:false} >{core.replacer(keyAdmin, false)}</option>);
				}
				var adm_delAdmin = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delAdminOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delAdmin} </div>);
				break;
			case 'adm_TaskReport':
				//отчеты по таскам
				var adm_TaskReportOption = new Array;
				adm_TaskReportOption.push(<option value="">Выберите задачу</option>);
				for(var keyTask in store.connectionStorage.getState().report){ 
					var dateEpochToString = new Date(store.connectionStorage.getState().report[keyTask].datetime);
					adm_TaskReportOption.push(<option value={keyTask} selected={(this.state.ParamOne === keyTask)?true:false} >{core.timeStamp(dateEpochToString) + '_' + store.connectionStorage.getState().report[keyTask].comment}</option>);
				}
				var adm_TaskReport = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_TaskReportOption} + </select></p>;
				var adm_TaskReportResult = new Array;
				if(this.state.ParamOne !== ""){
					var tempStorage = store.connectionStorage.getState().report;
					var reportTaskCOMPLETE = '',
						reportTaskERRORS = '',
						reportTaskTEXT = '',
						reportTaskDEPEN = '';
					if(tempStorage[this.state.ParamOne].incomplete.length > 0) {
						reportTaskCOMPLETE = <div className="textRED" id="blink1"> Есть невыполненные задания! </div>;
					} else if (tempStorage[this.state.ParamOne].errors === 0) {
						reportTaskCOMPLETE = <div className="textGREEN" id="blink1"> Все задания выполнены! </div>;
					}
					if(tempStorage[this.state.ParamOne].errors > 0) {
						reportTaskERRORS = <div className="textRED" id="blink2"> Есть ошибки выполнения! </div>;
					}
					var reportTaskUID = <div> UID: {this.state.ParamOne} </div>;
					if((typeof(tempStorage[this.state.ParamOne].text) === 'string') && (tempStorage[this.state.ParamOne].text !== '')){
						reportTaskTEXT = <div> {tempStorage[this.state.ParamOne].text} </div>;
					}
					if((typeof(tempStorage[this.state.ParamOne].dependencies) === 'string') && (tempStorage[this.state.ParamOne].dependencies !== '')){
						reportTaskDEPEN = <div> Зависимости: {tempStorage[this.state.ParamOne].dependencies} </div>;
					}
					adm_TaskReportResult.push(<div className={'reportTableRow'}> {reportTaskUID} {reportTaskCOMPLETE} {reportTaskERRORS} {reportTaskTEXT} {reportTaskDEPEN}  <br /> </div>)
					if(typeof(tempStorage[this.state.ParamOne]) !== 'undefined'){
						var tempObjects = tempStorage[this.state.ParamOne].objects;
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
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_TaskReport} <div className="reportTable">{adm_TaskReportResult}</div></div>);
				break;
			case 'adm_TaskOnline':
				//отчет по онлайну
				var adm_OnlineOn = new Array; 
				var adm_OnlineOff = new Array; 
				for(var keyOnlineAll in store.serverStorage.getState().users){
					if(typeof(store.connectionStorage.getState().users[keyOnlineAll]) !== 'undefined'){
						adm_OnlineOn.push(<div className={"adm_OnlineOn0"}><div>{core.replacer(keyOnlineAll, false)}</div><div className={(store.connectionStorage.getState().versions[keyOnlineAll] !== store.connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(store.connectionStorage.getState().versions[keyOnlineAll]) === 'string')?store.connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
					} else {
						adm_OnlineOff.push(<div className={"adm_OnlineOff0"}><div>{core.replacer(keyOnlineAll, false)}</div><div className={(store.connectionStorage.getState().versions[keyOnlineAll] !== store.connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(store.connectionStorage.getState().versions[keyOnlineAll]) === 'string')?store.connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
					}
				}
				AdminIoCommanderPanelBodyMiddle.push(<div className="reportOnline"> {(adm_OnlineOn.length !== 0)?<div className="adm_OnlineOn">{adm_OnlineOn}</div>:''} {(adm_OnlineOff.length !== 0)?<div className="adm_OnlineOff">{adm_OnlineOff}</div>:''}</div>);
				break;
			default:
				AdminIoCommanderPanelBodyMiddle.push(<div> Неизвестный тип команды! </div>);
				break;
		};
		if ((this.state.CommandType !== 'adm_TaskReport') && (this.state.CommandType !== 'adm_TaskOnline')){
			var AdminIoCommanderPanelBodyBottom = <div className={"AdminIoCommanderPanelBodyBottom" + ((this.state.CommandType === 'adm_setTask')?" inputFieldCenterRight inputFieldCenterRightBotton":"") + (((this.state.CommandType === 'adm_setUser') || this.state.CommandType === 'adm_setAdmin')?" inputFieldCenter":"") + (((this.state.CommandType === 'adm_delUser') || this.state.CommandType === 'adm_delAdmin')?" inputFieldCenterReal":"")}><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Выполнить</button></div>;
		} 
		return (
			<div className="PanelBodyMargin">
				<center>
					{AdminIoCommanderPanelBodyMiddle}
					{AdminIoCommanderPanelBodyBottom }
				</center>
			</div>
		);
	}
	
}

module.exports = AdminIoCommanderPanelBodyPage;