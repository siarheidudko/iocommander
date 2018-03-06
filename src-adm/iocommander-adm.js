/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/



/* ### Хранилища состояний ### */
var serverStorage = Redux.createStore(editServerStore);
var connectionStorage = Redux.createStore(editConnStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
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
		console.log(colors.red(datetime() + "Ошибка при обновлении хранилища:" + e));
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
		console.log(colors.red(datetime() + "Ошибка при обновлении хранилища соединений:" + e));
	}
	return state;
}



/* ### Раздел функций ### */
//функция авторизации в сокете
function login(socket, user_val, password_val) {
	if(typeof(socket) === 'object'){
		socket.emit('login', { user: user_val, password: password_val });
	}
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
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
		console.log(colors.red(datetime() + "Ошибка генерации uid!"));
	}
}

//функция работы с сокетом
function listenSocket(socket){
	socket.on('sendServerStorageToAdmin', function (data) {
		serverStorage.dispatch({type:'SYNC_OBJECT', payload: data});
	});
	socket.on('sendConnStorageToAdmin', function (data) {
		connectionStorage.dispatch({type:'SYNC_OBJECT', payload: data});
	});
	socket.on('disconnect', () => {
		serverStorage.dispatch({type:'CLEAR_STORAGE'});
		connectionStorage.dispatch({type:'CLEAR_STORAGE'});
		console.log(datetime() + "Соединение разорвано!");
	});
}

//функция инициализации проекта
function initialiseSocket(login_val, password_val){
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
					} else {
						serverStorage.dispatch({type:'CLEAR_STORAGE'});
						connectionStorage.dispatch({type:'CLEAR_STORAGE'});
						console.log(datetime() + "Авторизация не пройдена!");
					}
				});
				listenSocket(socket);
			}
		} while (typeof(socket) === 'undefined');
	} else {
		console.log(datetime() + "Не могу распознать объект конфигурации!");
	}
}