/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

import _ from 'lodash';
import CryptoJS from 'crypto-js';
import io from 'socket.io-client';

var store = require('./iocom.store.js');
var FileSaver = require('file-saver');

"use strict"

//функция авторизации в сокете
function login(socket, user_val, password_val) {
	try {
		if(typeof(socket) === 'object'){
			socket.emit('login', { user: user_val, password: password_val });
		}
	} catch(e){
		window.console.log("Ошибка авторизации в сокете:" + e);
		popup("Ошибка авторизации в сокете:" + e);
	}
}

//функция для таймштампа консоли
function datetime() {
	try {
		var dt = new Date();
		return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	} catch(e) {
		window.console.log("Проблема с функцией datetime()!");
		popup("Проблема с функцией datetime()!");
	}
}

//функция генерации валидного таймштампа для отчетов "01.01.2018 10:01:01"
function timeStamp(dataObject){
	try {
		var resultString;
		if(dataObject.getDate() > 9){
			resultString = dataObject.getDate() + '.';
		} else {
			resultString = '0' + dataObject.getDate() + '.';
		}
		if((dataObject.getMonth()+1) > 9){
			resultString = resultString + (dataObject.getMonth()+1) + '.' + dataObject.getFullYear() + ' ';
		} else {
			resultString = resultString + '0' + (dataObject.getMonth()+1) + '.' + dataObject.getFullYear() + ' ';
		}
		if(dataObject.getHours() > 9){
			resultString = resultString + dataObject.getHours() + ':';
		} else {
			resultString = resultString + '0' + dataObject.getHours() + ':';
		}
		if(dataObject.getMinutes() > 9){
			resultString = resultString + dataObject.getMinutes() + ':';
		} else {
			resultString = resultString + '0' + dataObject.getMinutes() + ':';
		}
		if(dataObject.getSeconds() > 9){
			resultString = resultString + dataObject.getSeconds();
		} else {
			resultString = resultString + '0' + dataObject.getSeconds();
		}
		return resultString;
	} catch(e){
		return '00.00.0000 00:00:00';
	}
}

//функция генерации UID
function generateUID() { 
	try {
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now(); 
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	} catch(e) {
		window.console.log("Ошибка генерации uid!");
		popup("Ошибка генерации uid!");
	}
}

//функция работы с сокетом
function listenSocket(socket){
	try {
		socket.on('sendServerStorageToAdmin', function (data) {
			try{
				store.serverStorage.dispatch({type:'SYNC_OBJECT', payload: data});
			} catch (e) {
				window.console.log("Ошибка обновления хранилища данных: " + e);
				popup("Ошибка обновления хранилища данных: " + e);
			}
		});
		socket.on('sendConnStorageToAdmin', function (data) {
			try {
				store.connectionStorage.dispatch({type:'SYNC_OBJECT', payload: data});
			} catch (e) {
				window.console.log("Ошибка обновления хранилища соединений: " + e);
				popup("Ошибка обновления хранилища соединений: " + e);
			}
		});
		socket.on('disconnect', () => {
			try {
				store.serverStorage.dispatch({type:'CLEAR_STORAGE'});
				store.connectionStorage.dispatch({type:'CLEAR_STORAGE'});
				window.console.log("Соединение разорвано!");
				popup("Соединение разорвано!");
			} catch (e) {
				window.console.log("Ошибка очистки хранилищ, при разрыве соединения: " + e);
			}
		});
	} catch(e){
		window.console.log("Ошибка прослушивания сокета: " + e);
		popup("Ошибка прослушивания сокета: " + e);
	}
}

//функция инициализации проекта
function initialiseSocket(login_val, passwd_val){
	try {
		var InitString = '{"protocol":"' + window.location.protocol.substr(0,window.location.protocol.length - 1) + '","server":"' + window.location.hostname + '","port":"444","login":"' + login_val + '","password":"' + passwd_val + '"}';
		var JsonInitString;
		try {			
			JsonInitString = (JSON.parse(InitString));
		} catch (e) {
			window.console.log("Не могу распарсить строку конфигурации!");
			popup("Не могу распарсить строку конфигурации!");
		}
		if(typeof(JsonInitString) === 'object'){
			var user_val = JsonInitString.login; 
			var password_val = CryptoJS.SHA256(user_val + JsonInitString.password+'icommander').toString();
			var protocol_val = JsonInitString.protocol,
			server_val = JsonInitString.server,	
			port_val = JsonInitString.port,
			socket = io(protocol_val + '://' + server_val + ':' + port_val, {transports: ['websocket']});
			window.socket = socket;
			if (typeof(socket) !== 'undefined'){
				socket.on('connect', () => {
					window.console.log("Соединение установлено!");
				});
				socket.on('initialize', function (data) {
					if(data.value === 'whois'){
						login(socket, user_val, password_val);
					}
				});
				socket.on('authorisation', function (data) {
					if(data.value === 'true'){
						window.console.log("Авторизация пройдена!");
						store.adminpanelStorage.dispatch({type:'AUTH', payload: {auth:true, login:login_val, pass:password_val}});
					} else {
						store.serverStorage.dispatch({type:'CLEAR_STORAGE'});
						store.connectionStorage.dispatch({type:'CLEAR_STORAGE'});
						window.console.log("Авторизация не пройдена!");
						socket.disconnect();
						store.adminpanelStorage.dispatch({type:'AUTH', payload: {auth:false}});
					}
				});
				listenSocket(socket);
			}
		} else {
			window.console.log("Не могу распознать объект конфигурации!");
			popup("Не могу распознать объект конфигурации!");
		}
	} catch(e){
		window.console.log("Критическая ошибка инициализации клиента!");
		popup("Критическая ошибка инициализации клиента!");
	}
}

//функция замены "." на "_" и обратно
function replacer(data_val, value_val){
	try {
		if(typeof(data_val === 'string')){
			if(value_val){
				return data_val.replace(/\./gi,"_");
			} else {
				return data_val.replace(/\_/gi,".");
			}
		} else {
			return '(не могу преобразовать, т.к. тип входящего аргумента не является строковым)';
		}
	} catch(e) {
		window.console.log("Ошибка преобразования имени пользователя!");
		popup("Ошибка преобразования имени пользователя!");
	}	
}

//функция отправки файлов на внутренний файл-сервер
function SendFileToInternalFS(files, ParamOne, ParamFour, ParamSix, ParamSeven, ParamNine, timeOnCompl, ParamEight, ParamTwelve){
	var result = new Promise(function(resolve, reject){
		if((typeof(window.files) === 'object') && (typeof(files[0]) === 'object')){
			var fd = new FormData();
			fd.append(ParamOne, files[0]);
			var serverlink = window.location.protocol.substr(0,window.location.protocol.length - 1) + '://' + window.location.hostname + ':' + window.location.port + '/upload';
			fetch(serverlink, {
				method: "POST",
				headers: {"Authorization": 'Basic ' + btoa(store.adminpanelStorage.getState().session.login + ':' + store.adminpanelStorage.getState().session.password)},
				body: fd
			}).then(function(response){
				resolve(response.text());
			}).catch(function(error){
				reject(error);
			});
		} else {
			popup('Файл не выбран!');
		}
	});
	result.then(
		function(resolve){
			if(resolve === 'upload'){
				var link = window.location.protocol.substr(0,window.location.protocol.length - 1) + '://' + window.location.hostname + ':' + store.connectionStorage.getState().fileport + '/' + ParamOne;
				var tempTask = {uid:ParamOne, task: {nameTask:'getFileFromWWW', extLink:link, intLink:ParamFour, fileName: files[0].name, exec:ParamTwelve, complete:'false', answer:'', platform:ParamSix, dependencies:ParamSeven, comment:ParamNine, timeoncompl:timeOnCompl}};
				for(var i=0;i<ParamEight.length;i++){
					var EmitMessage = new Array(ParamEight[i], tempTask);
					window.socket.emit('adm_setTask', EmitMessage);
				}
				store.adminpanelStorage.dispatch({type:'CLEAR_TASK'}); 
				popup("Задача отправлена на сервер!");
			} else {
				window.console.log("Проблема загрузки файла на внутренний сервер!");
				popup(resolve);
			}
		} 
	).catch(function(reject){
			popup(''+reject);
	});
}

//функция работы с всплывающим уведомлением
function popup(data){
	store.adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:data}});
}

//функция приведения отчетов к csv
function jsonReportToCSV(_uid){
	try{
		const data = _.clone(connectionStorage.getState().report[_uid].objects);
		var csv = 'Учетная запись;Статус выполнения;Результат;Дата создания;Запуск отложен до;Дата выполнения;\n';
		for(const key in data){
			var user_r = '', status_r = '', result_r = '', datetime_r = '', datetimeout_r ='', datetimecompl_r = '';
			if(typeof(key) === 'string'){user_r = replacer(key, false);}
			if(data[key].complete == 'true'){
				if(data[key].tryval < 100){
					status_r = 'Выполнено';
				} else {
					status_r = 'Ошибка';
				}
			} else {
				status_r = 'Не выполнено';
			}
			if(typeof(data[key].answer) === 'string'){result_r = data[key].answer.replace(/\r/gi, '').replace(/\n/gi, ' | ');}
			if(typeof(data[key].datetime) === 'number'){datetime_r = timeStamp(new Date(data[key].datetime));}
			if(typeof(data[key].datetimeout) === 'number'){datetimeout_r = timeStamp(new Date(data[key].datetimeout));}
			if(typeof(data[key].datetimecompl) === 'number'){datetimecompl_r = timeStamp(new Date(data[key].datetimecompl));}
			csv = csv + user_r + ';' + status_r + ';' + result_r + ';' + datetime_r + ';' + datetimeout_r + ';' + datetimecompl_r + ';\n';
		}
		var file = new File([csv], _uid+".csv", {type: "text/plain;charset=utf-8"});
		return file;
	} catch(e){
		console.log('Ошибка преобразования json в csv: '+e);
		return 'error';
	}
}

module.exports.SendFileToInternalFS = SendFileToInternalFS;
module.exports.replacer = replacer;
module.exports.initialiseSocket = initialiseSocket;
module.exports.listenSocket = listenSocket;
module.exports.generateUID = generateUID;
module.exports.timeStamp = timeStamp;
module.exports.datetime = datetime;
module.exports.login = login;
module.exports.popup = popup;
module.exports.FileSaver = FileSaver;
module.exports.jsonReportToCSV = jsonReportToCSV;