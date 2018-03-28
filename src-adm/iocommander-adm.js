/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/



/* ### Хранилища состояний ### */
var serverStorage = Redux.createStore(editServerStore);
var connectionStorage = Redux.createStore(editConnStore);
var adminpanelStorage = Redux.createStore(editAdmpanelStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
function editServerStore(state = {users:{}, admins:{}, tasks: {}}, action){
	try {
		switch (action.type){
			case 'SYNC_OBJECT':
				var state_new = action.payload;
				return state_new;
				break;
			case 'CLEAR_STORAGE':
				var state_new = {users:{}, admins:{}, tasks: {}};
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(datetime() + "Ошибка при обновлении хранилища:" + e);
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка при обновлении хранилища serverStorage:" + e}});
	}
	return state;
}
function editConnStore(state = {uids:{}, users:{}, report:{}, groups:{}, fileport:''}, action){
	try {
		switch (action.type){
			case 'SYNC_OBJECT':
				var state_new = action.payload;
				return state_new;
				break;
			case 'CLEAR_STORAGE':
				var state_new = {uids:{}, users:{}};
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(datetime() + "Ошибка при обновлении хранилища соединений:" + e);
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка при обновлении хранилища connectionStorage:" + e}});
	}
	return state;
}
function editAdmpanelStore(state = {auth: false, popuptext:'', session:{}}, action){
	try {
		switch (action.type){
			case 'AUTH':
				var state_new = _.clone(state);
				state_new.auth = action.payload.auth;
				state_new.session = {};
				if(action.payload.auth === false){
					state_new.popuptext = 'Авторизация не пройдена!';
					state_new.session.login = '';
					state_new.session.password = '';
				} else {
					state_new.session.login = action.payload.login;
					state_new.session.password = action.payload.pass;
				}
				return state_new;
				break;
			case 'MSG_POPUP':
				var state_new = _.clone(state);
				state_new.popuptext = action.payload.popuptext;
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(datetime() + "Ошибка при обновлении хранилища админпанели:" + e);
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка при обновлении хранилища adminpanelStorage:" + e}});
	}
	return state;
}



/* ### Раздел функций ### */
//функция авторизации в сокете
function login(socket, user_val, password_val) {
	try {
		if(typeof(socket) === 'object'){
			socket.emit('login', { user: user_val, password: password_val });
		}
	} catch(e){
		console.log(datetime() + "Ошибка авторизации в сокете:" + e);
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка авторизации в сокете:" + e}});
	}
}

//функция для таймштампа консоли
function datetime() {
	try {
		var dt = new Date();
		return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	} catch(e) {
		console.log("Проблема с функцией datetime()!");
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Проблема с функцией datetime()!"}});
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
		console.log(datetime() + "Ошибка генерации uid!");
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка генерации uid!"}});
	}
}

//функция работы с сокетом
function listenSocket(socket){
	try {
		socket.on('sendServerStorageToAdmin', function (data) {
			try{
				serverStorage.dispatch({type:'SYNC_OBJECT', payload: data});
			} catch (e) {
				console.log(datetime() + "Ошибка обновления хранилища данных: " + e);
				adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка обновления хранилища данных: " + e}});
			}
		});
		socket.on('sendConnStorageToAdmin', function (data) {
			try {
				connectionStorage.dispatch({type:'SYNC_OBJECT', payload: data});
			} catch (e) {
				console.log(datetime() + "Ошибка обновления хранилища соединений: " + e);
				adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка обновления хранилища соединений: " + e}});
			}
		});
		socket.on('disconnect', () => {
			try {
				serverStorage.dispatch({type:'CLEAR_STORAGE'});
				connectionStorage.dispatch({type:'CLEAR_STORAGE'});
				console.log(datetime() + "Соединение разорвано!");
				adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Соединение разорвано!"}});
			} catch (e) {
				console.log(datetime() + "Ошибка очистки хранилищ, при разрыве соединения: " + e);
			}
		});
	} catch(e){
		console.log(datetime() + "Ошибка прослушивания сокета: " + e);
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка прослушивания сокета: " + e}});
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
			console.log(datetime() + "Не могу распарсить строку конфигурации!");
			adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Не могу распарсить строку конфигурации!"}});
		}
		if(typeof(JsonInitString) === 'object'){
			var user_val = JsonInitString.login; 
			var password_val = CryptoJS.SHA256(user_val + JsonInitString.password+'icommander').toString();
			var protocol_val = JsonInitString.protocol,
			server_val = JsonInitString.server,	
			port_val = JsonInitString.port,
			socket = io(protocol_val + '://' + server_val + ':' + port_val);
			window.socket = socket;
			if (typeof(socket) !== 'undefined'){
				socket.on('connect', () => {
					console.log(datetime() + "Соединение установлено!");
				});
				socket.on('initialize', function (data) {
					if(data.value === 'whois'){
						login(socket, user_val, password_val);
					}
				});
				socket.on('authorisation', function (data) {
					if(data.value === 'true'){
						console.log(datetime() + "Авторизация пройдена!");
						adminpanelStorage.dispatch({type:'AUTH', payload: {auth:true, login:login_val, pass:password_val}});
					} else {
						serverStorage.dispatch({type:'CLEAR_STORAGE'});
						connectionStorage.dispatch({type:'CLEAR_STORAGE'});
						console.log(datetime() + "Авторизация не пройдена!");
						socket.disconnect();
						adminpanelStorage.dispatch({type:'AUTH', payload: {auth:false}});
					}
				});
				listenSocket(socket);
			}
		} else {
			console.log(datetime() + "Не могу распознать объект конфигурации!");
			adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Не могу распознать объект конфигурации!"}});
		}
	} catch(e){
		console.log(datetime() + "Критическая ошибка инициализации клиента!");
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Критическая ошибка инициализации клиента!"}});
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
		console.log(datetime() + "Ошибка преобразования имени пользователя!");
		adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Ошибка преобразования имени пользователя!"}});
	}	
}

//функция отправки файлов на внутренний файл-сервер
function SendFileToInternalFS(files, ParamOne, ParamFour, ParamSix, ParamSeven, ParamNine, timeOnCompl, ParamEight){
	var result = new Promise(function(resolve){
		var fd = new FormData();
		fd.append(files[0].name, files[0]);
		xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (this.readyState==4 && this.status==200) {
				resolve(this.responseText);
			} else if (this.readyState==4) {
				if(typeof(this.responseText) === 'string'){
					resolve(this.responseText);
				} else {
					resolve('unidentified error');
				}
			}
		}
		var serverlink = window.location.protocol.substr(0,window.location.protocol.length - 1) + '://' + window.location.hostname + ':' + window.location.port + '/upload';
		xmlhttp.open("POST",serverlink,true);
		xmlhttp.setRequestHeader('Authorization', 'Basic ' + btoa(adminpanelStorage.getState().session.login + ':' + adminpanelStorage.getState().session.password));
		xmlhttp.send(fd);
	});
	result.then(
		function(value){
			if(value === 'upload'){
				var link = window.location.protocol.substr(0,window.location.protocol.length - 1) + '://' + window.location.hostname + ':' + connectionStorage.getState().fileport + '/' + self.refs.FileUploadToServer.files[0].name;
				var tempTask = {uid:ParamOne, task: {nameTask:'getFileFromWWW', extLink:link, intLink:ParamFour, fileName: files[0].name, exec:'false', complete:'false', answer:'', platform:ParamSix, dependencies:ParamSeven, comment:ParamNine, timeoncompl:timeOnCompl.getTime()}};
				for(var i=0;i<ParamEight.length;i++){
					var EmitMessage = new Array(ParamEight[i], tempTask);
					window.socket.emit('adm_setTask', EmitMessage);
				}
			} else {
				console.log(datetime() + "Проблема загрузки файла на внутренний сервер!");
				adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:value}});
			}
		}, 
		function(error){
			adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:error}});
	});
}

