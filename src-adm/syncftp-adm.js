/* ### Раздел инициализации ### */

const InitString = '{"protocol":"http","server":"localhost","port":"80","login":"serg.dudko","password":"12345"}';

const colors=require("colors"),
cryptojs=require("cryptojs"),
redux=require("redux"),
lodash=require("lodash");
var user_val = '', 
password_val = '';

getSettings().then(function(value){
	if(value !== 'error'){
		user_val = value.login; 
		password_val = cryptojs.Crypto.MD5(value.password);
		if(typeof(socket) !== 'undefined'){
			socket.close();
		}
		var protocol_val = value.protocol,
		server_val = value.server,	
		port_val = value.port,
		socket = require('socket.io-client').connect(protocol_val + '://' + server_val + ':' + port_val);
		do {
			if (typeof(socket) !== 'undefined'){
				socket.on('connect', () => {
					console.log(colors.green(datetime() + "Соединение установлено!"));
				});
				socket.on('initialize', function (data) {
					if(data.value === 'whois'){
						login(socket);
					}
				});
				socket.on('authorisation', function (data) {
					if(data.value === 'true'){
						console.log(colors.green(datetime() + "Авторизация пройдена!"));
					} else {
						//если авторизация неудачна, пробую каждые 5 минут
						console.log(colors.red(datetime() + "Авторизация не пройдена!"));
						setTimeout(login, 300000);
					}
				});
				listenSocket(socket);
			}
		} while (typeof(socket) === 'undefined');
	}
}).catch(function(reason){console.log(colors.red(datetime() + "Ошибка инициализации!"));});



/* ### Хранилище состояний REDUX ### */
/*
function editStore(state = {tasks: {}, complete: [], incomplete:[]}, action){
	if(action.type === 'ADD_TASK'){
		var state_new = {tasks: {}, complete: [], incomplete:[]};
		state_new = lodash.clone(state);
		state_new.tasks[action.payload.uid] = action.payload.task;
		return state_new;
	}
	if(action.type === 'TASK_COMPLETE'){
		var state_new = {tasks: {}, complete: [], incomplete:[]};
		state_new = lodash.clone(state);
		state_new.complete.push(action.payload.uid);
		if(clientStorage.getState().incomplete.indexOf(action.payload.uid) !== -1){
			state_new.incomplete.splice(clientStorage.getState().incomplete.indexOf(action.payload.uid),1);
		}
		return state_new;
	}
	if(action.type === 'TASK_INCOMPLETE'){
		var state_new = {tasks: {}, complete: [], incomplete:[]};
		state_new = lodash.clone(state);
		state_new.incomplete.push(action.payload.uid);
		if(clientStorage.getState().complete.indexOf(action.payload.uid) !== -1){
			state_new.complete.splice(clientStorage.getState().complete.indexOf(action.payload.uid),1);
		}
		return state_new;
	}
	return state;
}
var clientStorage = redux.createStore(editStore);

clientStorage.subscribe(function(){
	//console.log(clientStorage.getState());
}); */



/* ### Раздел функций ### */

//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		try {			
			resolve(JSON.parse(InitString));
		} catch (e) {
			console.log(colors.red(datetime() + "Некорректная конфигурация!"));
			resolve('error');
		}
	});
}

//функция авторизации в сокете
function login(socket) {
	if(typeof(socket) === 'object'){
		socket.emit('login', { user: user_val, password: password_val });
	}
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
}

//функция работы с сокетом
function listenSocket(socket){
	socket.on('disconnect', () => {
		console.log(colors.red(datetime() + "Соединение разорвано!"));
	});
}