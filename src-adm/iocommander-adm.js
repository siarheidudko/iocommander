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
	}
	return state;
}
function editConnStore(state = {uids:{}, users:{}}, action){
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
	}
	return state;
}
function editAdmpanelStore(state = {auth: false, report:{}}, action){
	try {
		switch (action.type){
			case 'AUTH':
				var state_new = _.clone(state);
				state_new.auth = action.payload.auth;
				return state_new;
				break;
			case 'GEN_REPORT':
				var state_new = _.clone(state);
				state_new.report = action.payload.report;
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(datetime() + "Ошибка при обновлении хранилища админпанели:" + e);
	}
	return state;
}

serverStorage.subscribe(function(){ //подпишем генерацию отчетов на изменение состояния постоянного хранилища
	GenerateReport();
});

///////////////////////////////////////////////////
//ПРИМЕРЫ:
//	initialiseSocket('serg.dudko', '12345');
//	window.socket.emit('adm_setTask', ['fitobel.apt01', {uid:generateUID(), task: {nameTask:'execCommand', execCommand:'echo "111"', platform:'win32', dependencies:['efc0a00f-00b3-489d-be28-b1760be01618', 'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf']}}]);
//////////////////////////////////////////////////


/* ### Раздел функций ### */
//функция авторизации в сокете
function login(socket, user_val, password_val) {
	try {
		if(typeof(socket) === 'object'){
			socket.emit('login', { user: user_val, password: password_val });
		}
	} catch(e){
		console.log(datetime() + "Ошибка авторизации в сокете:" + e);
	}
}

//функция для таймштампа консоли
function datetime() {
	try {
		var dt = new Date();
		return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	} catch(e) {
		console.log("Проблема с функцией datetime()!");
	}
}

//
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
			}
		});
		socket.on('sendConnStorageToAdmin', function (data) {
			try {
				connectionStorage.dispatch({type:'SYNC_OBJECT', payload: data});
			} catch (e) {
				console.log(datetime() + "Ошибка обновления хранилища соединений: " + e);
			}
		});
		socket.on('disconnect', () => {
			try {
				serverStorage.dispatch({type:'CLEAR_STORAGE'});
				connectionStorage.dispatch({type:'CLEAR_STORAGE'});
				console.log(datetime() + "Соединение разорвано!");
			} catch (e) {
				console.log(datetime() + "Ошибка очистки хранилищ, при разрыве соединения: " + e);
			}
		});
	} catch(e){
		console.log(datetime() + "Ошибка прослушивания сокета: " + e);
	}
}

//функция инициализации проекта
function initialiseSocket(login_val, password_val){
	try {
		var InitString = '{"protocol":"http","server":"localhost","port":"444","login":"' + login_val + '","password":"' + password_val + '"}';
		var JsonInitString;
		try {			
			JsonInitString = (JSON.parse(InitString));
		} catch (e) {
			console.log(datetime() + "Не могу распарсить строку конфигурации!");
		}
		if(typeof(JsonInitString) === 'object'){
			var user_val = JsonInitString.login; 
			var password_val = CryptoJS.SHA256(user_val + JsonInitString.password+'icommander').toString();
			if(typeof(socket) !== 'undefined'){
				socket.close();
			}
			var protocol_val = JsonInitString.protocol,
			server_val = JsonInitString.server,	
			port_val = JsonInitString.port,
			socket = io(protocol_val + '://' + server_val + ':' + port_val);
			window.socket = socket;
			do {
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
							adminpanelStorage.dispatch({type:'AUTH', payload: {auth:true}});
						} else {
							serverStorage.dispatch({type:'CLEAR_STORAGE'});
							connectionStorage.dispatch({type:'CLEAR_STORAGE'});
							console.log(datetime() + "Авторизация не пройдена!");
							adminpanelStorage.dispatch({type:'AUTH', payload: {auth:false}});
						}
					});
					listenSocket(socket);
				}
			} while (typeof(socket) === 'undefined');
		} else {
			console.log(datetime() + "Не могу распознать объект конфигурации!");
		}
	} catch(e){
		console.log(datetime() + "Критическая ошибка инициализации сервера!");
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
	}	
}

//функция обработки заданий (отчеты)
function GenerateReport(){
	try {
		var tempStorage = serverStorage.getState().tasks;
		var reportStore = {};
		for(var keyObject in tempStorage){
			try {
				for(var keyTask in tempStorage[keyObject]){
					try {
						if(typeof(reportStore[keyTask]) === 'undefined'){
							reportStore[keyTask] = {complete:[],incomplete:[],objects:{}};
						}
						if(tempStorage[keyObject][keyTask].complete === 'true'){
							reportStore[keyTask].complete.push(keyObject);
						} else {
							reportStore[keyTask].incomplete.push(keyObject);
						}
						if(typeof(reportStore[keyTask].objects[keyObject]) === 'undefined'){
							reportStore[keyTask].objects[keyObject] = {};
						}
						reportStore[keyTask].objects[keyObject].datetime = tempStorage[keyObject][keyTask].datetime;
						reportStore[keyTask].objects[keyObject].datetimecompl = tempStorage[keyObject][keyTask].datetimecompl;
						reportStore[keyTask].objects[keyObject].complete = tempStorage[keyObject][keyTask].complete;
						reportStore[keyTask].objects[keyObject].answer = tempStorage[keyObject][keyTask].answer;
					} catch(e){
						console.log(datetime() + "Не обработан таск " + keyTask + " для " + keyObject + " при генерации отчета!");
					}
				}
			} catch(e){
				console.log(datetime() + "Ошибка генерации отчета по таскам для " + keyObject + "!");
			}
		}
		adminpanelStorage.dispatch({type:'GEN_REPORT', payload: {report:reportStore}});
	} catch(e){
		console.log(datetime() + "Ошибка генерации отчетов по таскам!");
	}
}
