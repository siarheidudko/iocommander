/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/

/* ### Раздел переменных ### */
const http=require("http"), 
colors=require("colors"),
fs=require("fs"),
cryptojs=require("cryptojs"),
redux=require("redux"),
lodash=require("lodash"),
firebase=require("firebase");
var port, firebase_user, firebase_pass, config;



/* ### Хранилища состояний ### */
var serverStorage = redux.createStore(editServerStore);
var connectionStorage = redux.createStore(editConnectionStore); 
//два хранилища нужны для уменьшения трафика между веб-интерфейсом и сервером, удобства записи в firebase (незачем там хранить данные реального времени о соединениях)

function editServerStore(state = {users:{}, admins:{}, tasks: {}}, action){
	try{
		switch (action.type){
			case 'ADD_USER':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.users[action.payload.user] = action.payload.password;
				return state_new;
				break;
			case 'REMOVE_USER':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.users[action.payload.user];
				return state_new;
				break;
			case 'ADD_ADMIN':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.admins[action.payload.user] = action.payload.password;
				return state_new;
				break;
			case 'REMOVE_ADMIN':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.admins[action.payload.user];
				return state_new;
				break;
			case 'ADD_TASK':
				var state_new = {};
				state_new = lodash.clone(state);
				if(typeof(state_new.tasks[action.payload.user]) === 'undefined'){
					state_new.tasks[action.payload.user] = {};
				}
				state_new.tasks[action.payload.user][action.payload.task.uid] = action.payload.task.task;
				return state_new;
				break;
			case 'COMPLETE_TASK':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.tasks[action.payload.user][action.payload.task].complete = 'true';
				state_new.tasks[action.payload.user][action.payload.task].answer = action.payload.answer;
				return state_new;
				break;
			case 'SYNC':
				var state_new = action.payload;
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка при обновлении основного хранилища:" + e));
	}
	return state;
}

serverStorage.subscribe(function(){
	AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
		if(value === 'auth'){
			SendData(serverStorage.getState());
		}
	}, function(error){
		console.log(colors.red(datetime() + "Ошибка при обновлении firebase:" + error));
	});
});

function editConnectionStore(state = {uids:{}, users:{}}, action){
	try {
		switch (action.type){
			case 'ADD_UID':
				var state_new = {};
				var useruid = state.users[action.payload.user];
				state_new = lodash.clone(state);
				delete state_new.users[action.payload.user]; //на всякий случай чистим объект от старых данных
				delete state_new.uids[useruid];
				state_new.uids[action.payload.uid] = action.payload.user;
				state_new.users[action.payload.user] = action.payload.uid;
				return state_new;
				break;
			case 'REMOVE_UID':
				var state_new = {};
				var username = state.uids[action.payload.uid];
				state_new = lodash.clone(state);
				delete state_new.uids[action.payload.uid];
				delete state_new.users[username];
				return state_new;
				break;
			case 'REMOVE_USER':
				var state_new = {};
				var useruid = state.users[action.payload.user];
				state_new = lodash.clone(state);
				delete state_new.users[action.payload.user];
				delete state_new.uids[useruid];
				return state_new;
				break;
			default:
				break;
		}
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка при обновлении хранилища состояний:" + e));
	}
	return state;
}



/* ### Раздел функций ### */
//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		try {
			fs.readFile(".\\src-server\\iocommander-server.conf", "utf8", function(error,data){
				if(error) throw error; 
				try {
					resolve(JSON.parse(data));
				} catch(e){
					console.log(colors.red(datetime() + "Конфигурационный файл испорчен!"));
					resolve('error');
				}
			});
		} catch (e) {
			console.log(colors.red(datetime() + "Конфигурационный файл недоступен!"));
			resolve('error');
		}
	});
}

//функция проверки имени пользователя и пароля
function testUser(user_val, password_val, socketid){
	try{
		connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socketid}});
		var renameuser = replacer(user_val, true);
		if(typeof(serverStorage.getState().users) !== 'undefined'){
			if ((serverStorage.getState().users[renameuser] === password_val) && (typeof(serverStorage.getState().users[renameuser]) !== 'undefined')){
				return true;
			} else {
				return false;
			}
		} else {
			console.log(colors.red(datetime() + "Объект пользователи основного хранилища не существует!"));
			return false;
		}
	} catch(e){
		connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socketid}});
		console.log(colors.red(datetime() + "Ошибка проверки имени пользователя и пароля пользователя!"));
	}
}

//функция проверки имени пользователя и пароля администратора
function testAdmin(user_val, password_val, socketid){
	try{
		connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socketid}});
		var renameuser = replacer(user_val, true);
		if(typeof(serverStorage.getState().admins) !== 'undefined'){
			if ((serverStorage.getState().admins[renameuser] === password_val) && (typeof(serverStorage.getState().admins[renameuser]) !== 'undefined')) {
				return true;
			} else {
				return false;
			}
		} else {
			console.log(colors.red(datetime() + "Объект администраторы основного хранилища не существует!"));
			return false;
		}
	} catch(e){
		connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socketid}});
		console.log(colors.red(datetime() + "Ошибка проверки имени пользователя и пароля администратора!"));
		return false;
	}
}

//функция записи в массив пользователей
function setUser(user_val, param_val, value_val){
	try {
		var renameuser = replacer(user_val, true);
		switch (param_val){
			case 'password':
				serverStorage.dispatch({type:'ADD_USER', payload: {user:renameuser, password:value_val}});
				console.log(colors.green(datetime() + "Регистрация пользователя\nLogin: " + user_val));
				break;
			case 'uid':
				connectionStorage.dispatch({type:'ADD_UID', payload: {uid:value_val, user:renameuser}});
				console.log(colors.green(datetime() + "Установка идентификатора пользователя\nLogin: " + user_val + "\nUID:" + value_val));
				break;
			default:
				console.log(colors.green(datetime() + "Неизвестная команда: " + param_val));
				break;
		}
	} catch(e) {
		console.log(colors.red(datetime() + "Ошибка добавления пользователя в основное хранилище!"));
	}
}

//функция записи в массив администраторов
function setAdmin(user_val, param_val, value_val){
	try {
		var renameuser = replacer(user_val, true);
		switch (param_val){
			case 'password':
				serverStorage.dispatch({type:'ADD_ADMIN', payload: {user:renameuser, password:value_val}});
				console.log(colors.green(datetime() + "Регистрация пользователя\nLogin: " + user_val));
				break;
			case 'uid':
				connectionStorage.dispatch({type:'ADD_UID', payload: {uid:value_val, user:renameuser}});
				console.log(colors.green(datetime() + "Установка идентификатора пользователя\nLogin: " + user_val + "\nUID:" + value_val));
				break;
			default:
				console.log(colors.green(datetime() + "Неизвестная команда: " + param_val));
				break;
		}
	} catch(e) {
		console.log(colors.red(datetime() + "Ошибка добавления администратора в основное хранилище!"));
	}
}

//функция для таймштампа
function datetime() {
	try {
		var dt = new Date();
		return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	} catch(e) {
		console.log(colors.red("Проблема с функцией datetime()!"));
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
		console.log(colors.red(datetime() + "Ошибка преобразования имени пользователя!"));
	}	
}

//функция добавления задачи
function setTask(user_val, value_val){
	try {
		if((typeof(value_val.task) !== 'undefined') && (typeof(value_val.uid) !== 'undefined')){
			var renameuser = replacer(user_val, true);
			value_val.task.complete = 'false';
			value_val.task.answer = '';
			serverStorage.dispatch({type:'ADD_TASK', payload: {user:renameuser, task:value_val}});
		} else {
			console.log(colors.yellow(datetime() + "Некорректный формат задания!"));
		}
	} catch(e) {
		console.log(colors.red(datetime() + "Ошибка добавления задания в основное хранилище!"));
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
		console.log(colors.red(datetime() + "Ошибка генерации uid!"));
	}
}

//функция авторизации в firebase
function AuthUserFirebase(email,pass){
	return new Promise(function (resolve){
		firebase.auth().signInWithEmailAndPassword(email, pass).then(function() {
			resolve('auth');
		}).catch(function(error) {
			resolve('noauth');
			console.log(colors.red(datetime() + "Проблема с авторизацией в firebase: " + error.message));
		});
	}, function(error){
		resolve('noauth');
		console.log(colors.red(datetime() + "Проблема с инициализацией авторизации в firebase: " + error));
	});
};

//функция получения данных из firebase
function GetFirebaseData(){
	return new Promise(function (resolve){
		firebase.database().ref('/').once('value').then(function(snapshot) {
			resolve(JSON.stringify(snapshot.val()));
		}, function(error) {
			console.log(colors.red(datetime() + "Проблема получения снимка firebase: " + error));
		});
	}, function(error){
		console.log(colors.red(datetime() + "Проблема инициализации получения снимка firebase: " + error));
	});
}

//функция записи данных в firebase
function SendData(DataBody){
	try {
		var tokendata = new Date();
		tokendatastr = tokendata.toString();
		firebase.database().ref('/').set(DataBody).then(function(value){
			console.log(colors.green(datetime() + "Синхронизация с firebase успешна!"));
		}).catch(function(error){
			console.log(colors.red(datetime() + "Ошибка записи данных: " + error.message));
		});
	} catch (e){
		console.log(colors.red(datetime() + "Проблема инициализации записи в firebase: " + e));
	}
}

//функция отправки содержимых хранилища в web
function sendStorageToWeb(io, param){
	try {
		var adminObject = serverStorage.getState().admins;
		var connObject = connectionStorage.getState().users;
		for(var admin in adminObject){
			try {
				var admUid = connectionStorage.getState().users[admin];
				if (typeof(admUid) !== 'undefined'){
					switch (param){
						case 'server':
							io.sockets.sockets[admUid].emit('sendServerStorageToAdmin', serverStorage.getState());
							break;
						case 'connection':
							io.sockets.sockets[admUid].emit('sendConnStorageToAdmin', connectionStorage.getState());
							break;
						default:
							io.sockets.sockets[admUid].emit('sendServerStorageToAdmin', serverStorage.getState());
							io.sockets.sockets[admUid].emit('sendConnStorageToAdmin', connectionStorage.getState());
							break;
					}
				}
			} catch (e) {
				console.log(colors.red(datetime() + "Проблема отправки данных в web, администратору " + admin +"!"));
			}
		}
	} catch (e){
		console.log(colors.red(datetime() + "Проблема отправки данных в web!"));
	}
}

//функция запуска web-сервера
function startWebServer(port){
	try {
		http.createServer(function(req, res){
			var pathFile;
			if(req.url === '/'){
				pathFile = './src-adm/index.html';
			} else {
				pathFile = './src-adm'+req.url;
			}
			try {
				fs.readFile(pathFile, 'utf-8', (err, file) => {
					if(err) {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end('Not Found');
					} else {
						res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
						res.end(file);
					}
				});	
			} catch (e){
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Internal Server Error');
			}
		}).listen(port, '0.0.0.0');
		console.log(colors.gray(datetime() + 'webserver-server listening on *:' + port));
	} catch (e){
		console.log(colors.red(datetime() + "Не могу запустить web-сервер!"));
	}
}



/* ### Раздел работы с сокетом ### */
try {
	getSettings().then(function(value){
		//загружаем файл конфигурации
		port = parseInt(value.port, 10);
		webport = parseInt(value.webport, 10);
		firebase_user = value.firebase_user;
		firebase_pass = value.firebase_pass;
		config = value.firebase_config;
		
		firebase.initializeApp(config);
		
		//грузим данные из firebase в redux при старте, если они не null
		var Initialize = new Promise(function(resolve){
			AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
				if(value === 'auth'){
					GetFirebaseData().then(function(value_child){
						if(value_child !== 'null'){
							try{
								var value_child_obj = JSON.parse(value_child);
								if((typeof(value_child_obj.users) !== 'undefined') && (typeof(value_child_obj.tasks) !== 'undefined') && (typeof(value_child_obj.admins) !== 'undefined')){
									serverStorage.dispatch({type:'SYNC', payload: value_child_obj});
								} else {
									console.log(colors.yellow(datetime() + "Один из обязательных аргументов отсутствует в firebase, база данных будет пересоздана."));
								}
							} catch(e){
								console.log(colors.red(datetime() + "Повреждение firebase, не могу корректно распарсить полученный объект:" + e));
							}
						} else {
							console.log(colors.yellow(datetime() + "Проблема с firebase, полученный снимок является пустым. Firebase будет перезаписана!"));
						}
						resolve('okay');
					}, function (error){
						console.log(colors.red(datetime() + "Повреждение firebase, не могу загрузить объект в основное хранилище: " + error));
					});
				}
			})
		}, function(error){
			console.log(colors.red(datetime() + "Проблема с загрузкой данных из firebase: " + error));
		});


		Initialize.then(function(value){
			if(value === 'okay'){
				
			///////////////////////////////////////////////////
			//ПРИМЕРЫ:
			//	setUser('fitobel.apt01', 'password', cryptojs.Crypto.SHA256('fitobel.apt01' + '12345678'+'icommander'));
			//	setAdmin('serg.dudko', 'password', cryptojs.Crypto.SHA256('serg.dudko' + '12345'+'icommander'));
				var task1 = {uid:generateUID(), task: {nameTask:'getFileFromWWW', extLink:'http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm', intLink:'/test/', fileName: '1.rpm', exec:'false', complete:'false', answer:'', dependencies:[]}};
				var task2 = {uid:generateUID(), task: {nameTask:'execFile', intLink:'', fileName: 'node', paramArray:['--version'], complete:'false', answer:'', dependencies:['efc0a00f-00b3-489d-be28-b1760be01618']}};
				var task3 = {uid:generateUID(), task: {nameTask:'execCommand', execCommand:'echo "111"', platform:'win32', dependencies:['efc0a00f-00b3-489d-be28-b1760be01618', 'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf']}};
				setTask('fitobel.apt01', task1);
				setTask('fitobel.apt01', task2);
			//	setTask('fitobel.apt03', task3);
				setTask('fitobel.apt01', task3);
			//////////////////////////////////////////////////
				
				server=http.createServer().listen(port, function() {
					console.log(colors.gray(datetime() + 'socket-server listening on *:' + port));
				}); 
					
				io=require("socket.io").listen(server, { log: true ,pingTimeout: 3600000, pingInterval: 25000});
				io.sockets.on('connection', function (socket) {
					try {
						io.sockets.sockets[socket.id].emit('initialize', { value: 'whois' });
						io.sockets.sockets[socket.id].on('login', function (data) { 
							if(testUser(data.user, data.password, socket.id)) {
								try {
									io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
									setUser(data.user, 'uid', socket.id);
									console.log(colors.green(datetime() + "Подключение пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
									io.sockets.sockets[socket.id].emit('sendtask', serverStorage.getState().tasks[replacer(data.user, true)]);
									io.sockets.sockets[socket.id].on('completetask', function (data) {
										serverStorage.dispatch({type:'COMPLETE_TASK', payload: {user:connectionStorage.getState().uids[socket.id], task:data.uid, answer:data.answer}});
									});
								} catch (e) {
									console.log(colors.red(datetime() + "Ошибка взаимодействия с пользователем " + data.user +": " + e));
								}
							} else if(testAdmin(data.user, data.password, socket.id)) {
								try {
									io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
									setUser(data.user, 'uid', socket.id);
									console.log(colors.green(datetime() + "Подключение администратора\nLogin: " + data.user + "\nUID: " + socket.id));
									sendStorageToWeb(io, 'all');
									io.sockets.sockets[socket.id].on('adm_setUser', function (data) {
										setUser(data[0], 'password', data[1]);
									});
									io.sockets.sockets[socket.id].on('adm_setAdmin', function (data) {
										setAdmin(data[0], 'password', data[1]);
									});
									io.sockets.sockets[socket.id].on('adm_setTask', function (data) {
										setTask(data[0],data[1]);
									});
									io.sockets.sockets[socket.id].on('adm_delUser', function (data) {
										serverStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
										connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
									});
									io.sockets.sockets[socket.id].on('adm_delAdmin', function (data) {
										serverStorage.dispatch({type:'REMOVE_ADMIN', payload: {user:data[0]}});
										connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
									});
								} catch (e) {
									console.log(colors.red(datetime() + "Ошибка взаимодействия с администратором " + data.user +": " + e));
								}
							} else {
								socket.emit('authorisation', { value: 'false' });
								console.log(colors.red(datetime() + "Неверный пароль для пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
							} 
						});
					  
						socket.on('disconnect', function () {
							connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socket.id}});
							console.log(colors.red(datetime() + "Отключение пользователя\nLogin: " + replacer(connectionStorage.getState().uids[socket.id], false) + "\nUID: " + socket.id));
						});
				    } catch (e){
						console.log(colors.red(datetime() + "Ошибка обработки входящего соединения: " + e));
					}
				});
				try {
					serverStorage.subscribe(function(){
						sendStorageToWeb(io, 'server');
					});
					connectionStorage.subscribe(function(){
						sendStorageToWeb(io, 'connection');
					});
				} catch (e) {
					console.log(colors.red(datetime() + "Не могу подписать веб-интерфейс на обновления: " + e));
				}
			}
		}, function(error){
			console.log(colors.red(datetime() + "Неизвестная критическая ошибка работы сервера: " + error));
		}); 
		//запускаю web-сервер
		startWebServer(webport);
	}, function(error){
		console.log(colors.red(datetime() + "Инициализация сервера не выполнена по причине: " + error));
	});
} catch (e){
	console.log(colors.red(datetime() + "Не могу загрузить конфигурацию сервера!"));
}