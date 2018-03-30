/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/

/* ### Раздел переменных ### */
const https=require("https"), 
http=require("http")
colors=require("colors"),
fs=require("fs"),
cryptojs=require("cryptojs"),
redux=require("redux"),
lodash=require("lodash"),
firebase=require("firebase"),
socketio=require("socket.io"),
multiparty=require("multiparty");
var port, firebase_user, firebase_pass, config, SslOptions, 
bantimeout = 10800000;
var SyncFirebaseTimeout = false;



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
				state_new.users = sortObjectFunc(state_new.users, '', 'string', false);
				return state_new;
				break;
			case 'REMOVE_USER':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.users[action.payload.user];
				delete state_new.tasks[action.payload.user];
				console.log(colors.yellow(datetime() + "Удаление пользователя\nLogin: " + action.payload.user));
				return state_new;
				break;
			case 'ADD_ADMIN':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.admins[action.payload.user] = action.payload.password;
				state_new.admins = sortObjectFunc(state_new.admins, '', 'string', false);
				return state_new;
				break;
			case 'REMOVE_ADMIN':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.admins[action.payload.user];
				console.log(colors.yellow(datetime() + "Удаление администратора\nLogin: " + action.payload.user));
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
				state_new.tasks[action.payload.user][action.payload.task].datetimecompl = Date.now();
				state_new.tasks[action.payload.user][action.payload.task].answer = action.payload.answer;
				state_new.tasks[action.payload.user][action.payload.task].tryval = action.payload.tryval;
				return state_new;
				break;
			case 'SYNC':
				var state_new = action.payload;
				state_new.users = sortObjectFunc(state_new.users, '', 'string', false);
				state_new.admins = sortObjectFunc(state_new.admins, '', 'string', false);
				return state_new;
				break;
			case 'GC_TASK':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.tasks[action.payload.user][action.payload.task];
				return state_new;
				break;
			case 'GC_USER':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.tasks[action.payload.user];
				return state_new;
				break;
			case 'GC_TASK_REPLANSW':
				var state_new = {};
				state_new = lodash.clone(state);
				var thisanswr = state_new.tasks[action.payload.user][action.payload.task].answer;
				state_new.tasks[action.payload.user][action.payload.task].answer =  '...' + thisanswr.substring(thisanswr.length - 501,thisanswr.length - 1);
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
	FirebaseSync();
	GenerateReport();
	GenerateGroup();
});

function editConnectionStore(state = {uids:{}, users:{}, report:{}, groups:{}, iptoban:{}, fileport:''}, action){
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
				state_new.uids = sortObjectFunc(state_new.uids, '', 'string', false);
				state_new.users = sortObjectFunc(state_new.users, '', 'string', false);
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
			case 'GEN_REPORT':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.report = action.payload.report;
				return state_new;
				break;
			case 'GEN_GROUP':
				var state_new = {};
				state_new = lodash.clone(state);
				state_new.groups = action.payload.groups;
				return state_new;
				break;
			case 'WRONG_PASS':
				var state_new = {};
				state_new = lodash.clone(state);
				if(typeof(state_new.iptoban[action.payload.address]) !== 'object'){
					state_new.iptoban[action.payload.address] = {};
					state_new.iptoban[action.payload.address].attemp = 0;
				}
				state_new.iptoban[action.payload.address].datetime = Date.now();
				state_new.iptoban[action.payload.address].attemp = state_new.iptoban[action.payload.address].attemp + 1;
				return state_new;
				break;
			case 'GC_WRONG_PASS_CLEAR':
				var state_new = {};
				state_new = lodash.clone(state);
				delete state_new.iptoban[action.payload.address];
				return state_new;
				break;
			case 'PARAM_PORTS':
				var state_new = {};
				state_new = lodash.clone(state);
				if(typeof(action.payload.fileportval) !== 'undefined'){
					state_new.fileport = action.payload.fileportval;
				}
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
			fs.readFile("./src-server/iocommander-server.conf", "utf8", function(error,data){
				try {	
					if(error) {
						throw error; 
					} else {
						resolve(JSON.parse(data));
					}
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
			value_val.task.datetime = Date.now();
			value_val.task.datetimecompl = 0;
			value_val.task.tryval = 0;
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

//функция записи авторизации в firebase с последующим вызовом записи SendData()
function FirebaseSync(){
	AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
		if(value === 'auth'){
			if(!SyncFirebaseTimeout){ //проверяем что флаг ожидания синхронизации еще не установлен
				SyncFirebaseTimeout = true; //установим флаг, что в хранилище есть данные ожидающие синхронизации
				setTimeout(SendData,60000); //синхронизируем хранилище через минуту (т.е. запрос не будет чаще, чем раз в минуту)
			}
		}
	}, function(error){
		console.log(colors.red(datetime() + "Ошибка при обновлении firebase:" + error));
		setTimeout(FirebaseSync,60000); //при ошибке запустим саму себя через минуту
	});
}

//функция записи данных в firebase
function SendData(){
	try {
		var tokendata = new Date();
		tokendatastr = tokendata.toString();
		firebase.database().ref('/').set(serverStorage.getState()).then(function(value){
			console.log(colors.green(datetime() + "Синхронизация с firebase успешна!"));
		}).catch(function(error){
			console.log(colors.red(datetime() + "Ошибка записи данных: " + error.message));
		});
		SyncFirebaseTimeout = false; //вернем начальное состояние флагу синхронизации
	} catch (e){
		console.log(colors.red(datetime() + "Проблема инициализации записи в firebase: " + e));
		setTimeout(SendData,60000); //при ошибке запустим саму себя через минуту
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
		var webserverfunc = function(req, res){
			try {
				if(typeof(connectionStorage.getState().iptoban) === 'object'){
					if(typeof(connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)]) === 'object') {
						var ThisSocketAttemp = connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)].attemp;
						var ThisSocketDatetime = connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)].datetime;
					}
				}
				if(typeof(ThisSocketAttemp) !== 'number'){
					ThisSocketAttemp = 0;
				}
				if(typeof(ThisSocketDatetime) !== 'number'){
					ThisSocketDatetime = 0;
				}
				if((ThisSocketAttemp > 5) && ((ThisSocketDatetime + bantimeout) > Date.now())){
					res.writeHead(403, {'Content-Type': 'text/plain'});
					res.end('Permission denied');
					console.log(colors.yellow(datetime() + "Попытка входа на web-сервер с заблокированного адреса " + req.connection.remoteAddress));
				} else {
					if(req.method === 'GET'){
						var pathFile;
						if(req.url === '/'){
							pathFile = './src-adm/index.html';
						} else {
							pathFile = './src-adm'+req.url;
						}
						try {
							fs.readFile(pathFile, (err, file) => {
								if(err) {
									res.writeHead(404, {'Content-Type': 'text/plain'});
									res.end('Not Found');
								} else {
									try{
										var ContentType = req.url.split('.');
										ContentType = ContentType[ContentType.length -1];
										switch(ContentType){
											case '/':
												res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
												break;
											case 'html':
												res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
												break;
											case 'js':
												res.writeHead(200, {'Content-Type': 'text/javascript; charset=UTF-8'});
												break;
											case 'css':
												res.writeHead(200, {'Content-Type': 'text/css; charset=UTF-8'});
												break;
											case 'ico':
												res.writeHead(200, {'Content-Type': 'image/x-icon'});
												break;
											default:
												res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
												break;
										}
									} catch(e){
										res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
									}
									res.end(file);
								}
							});	
						} catch (e){
							res.writeHead(500, {'Content-Type': 'text/plain'});
							res.end('Internal Server Error');
						}
					} else {
						try {
							var pathFile = './files/'+req.url;
							try {
								if(typeof(req.headers['authorization']) !== 'undefined'){
									var auth = req.headers['authorization'];
								}
								if(!auth){
									res.statusCode = 401;
									res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
									res.end('Permission denied');
								} else if(auth){
									try {
										var tmp = auth.split(' ');
										var buf = new Buffer(tmp[1], 'base64');
										var plain_auth = buf.toString();
										var creds = plain_auth.split(':'); 
										var username = replacer(creds[0], true);
										var password = creds[1];
										if ((serverStorage.getState().admins[username] === password) && (typeof(serverStorage.getState().admins[username]) !== 'undefined')) { 
											if (req.url === '/upload') {									
												var form = new multiparty.Form();
												form.parse(req, function(err, fields, files) {
													try{
														if(err){
															throw err;
														} else {
															var FilesNull = true;
															for(var keyFile in files){
																FilesNull = false;
																fs.copyFile(files[keyFile][0].path, './files/' + keyFile, (err) => {
																	try{
																		if (err) throw err;
																		res.writeHead(200, {'content-type': 'text/plain'});
																		res.end('upload');
																		console.log(colors.green(datetime() + "Пользователем " + username + ' с адреса ' + req.connection.remoteAddress + ' загружен файл ./files/' + keyFile));
																	} catch(e){
																		res.writeHead(500, {'Content-Type': 'text/plain'});
																		res.end('Internal Server Error');
																		console.log(colors.red(datetime() + "Ошибка копирования входящего файла!"));
																	}
																});
															}
															if(FilesNull){
																res.writeHead(500, {'Content-Type': 'text/plain'});
																res.end('Internal Server Error');
																console.log(colors.red(datetime() + "Файлы не получены!"));
															}
														}
													} catch(e) {
														res.writeHead(500, {'Content-Type': 'text/plain'});
														res.end('Internal Server Error');
														console.log(e);
														console.log(colors.red(datetime() + "Ошибка обработки formdata на web(POST)-сервере!"));
													}
												}); 
												return;
											} else {
												res.writeHead(500, {'Content-Type': 'text/plain'});
												res.end('Internal Server Error');
												console.log(colors.red(datetime() + "Некорректный запрос на web(POST)-сервер!"));
											}							
										}else {
											res.statusCode = 401;
											res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
											res.end('Permission denied');
											connectionStorage.dispatch({type:'WRONG_PASS', payload: {address:replacer(req.connection.remoteAddress, true)}});
											console.log(colors.red(datetime() + "Попытка подключения к web(POST)-серверу с неверным паролем с адреса " + req.connection.remoteAddress));
										}
									} catch(e){
										res.writeHead(500, {'Content-Type': 'text/plain'});
										res.end('Internal Server Error');
										console.log(colors.red(datetime() + "Ошибка проверки пароля для доступа к web(POST)-серверу!"));
									}
								}
							} catch (e){
								res.writeHead(500, {'Content-Type': 'text/plain'});
								res.end('Internal Server Error');
								console.log(colors.red(datetime() + "Ошибка обработки запроса на web(POST)-сервере:" + e));
							}
						} catch(e){
							res.writeHead(500, {'Content-Type': 'text/plain'});
							res.end('Internal Server Error');
							console.log(colors.red(datetime() + "Ошибка работы web(POST)-сервера:" +e));
						}
					}
				}
			}catch(e){
				console.log(colors.red(datetime() + "Критическая ошибка работы web-сервера:" +e));
			}
		};
		if(SslOptions !== 'error'){ 
			var server = https.createServer(SslOptions, webserverfunc).listen(port, '0.0.0.0');
			console.log(colors.gray(datetime() + 'https-webserver-server listening on *:' + port));
		} else {
			var server = http.createServer(webserverfunc).listen(port, '0.0.0.0');
			console.log(colors.gray(datetime() + 'http-webserver-server listening on *:' + port));
		}
		server.maxHeadersCount = 200;
		server.timeout = 120000;
	} catch (e){
		console.log(colors.red(datetime() + "Не могу запустить web-сервер!"));
	}
}

//функция запуска file-сервера
function startFileServer(port, fileConnLimit){
	try {
		var webserverfunc = function(req, res){
			try {
				if(typeof(connectionStorage.getState().iptoban) === 'object'){
					if(typeof(connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)]) === 'object') {
						var ThisSocketAttemp = connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)].attemp;
						var ThisSocketDatetime = connectionStorage.getState().iptoban[replacer(req.connection.remoteAddress, true)].datetime;
					}
				}
				if(typeof(ThisSocketAttemp) !== 'number'){
					ThisSocketAttemp = 0;
				}
				if(typeof(ThisSocketDatetime) !== 'number'){
					ThisSocketDatetime = 0;
				}
				if((ThisSocketAttemp > 5) && ((ThisSocketDatetime + bantimeout) > Date.now())){
					res.writeHead(403, {'Content-Type': 'text/plain'});
					res.end('Permission denied');
					console.log(colors.yellow(datetime() + "Попытка входа на file-сервер с заблокированного адреса " + req.connection.remoteAddress));
				} else {
					var pathFile = './files/'+req.url;
					try {
						if(typeof(req.headers['authorization']) !== 'undefined'){
							var auth = req.headers['authorization'];
						}
						if(!auth){
							res.statusCode = 401;
							res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
							res.end('Permission denied');
						} else if(auth){
							try {
								var tmp = auth.split(' ');
								var buf = new Buffer(tmp[1], 'base64');
								var plain_auth = buf.toString();
								var creds = plain_auth.split(':'); 
								var username = replacer(creds[0], true);
								var password = creds[1];
								if((serverStorage.getState().users[username] === password) && (typeof(serverStorage.getState().users[username]) !== 'undefined')){
									fs.readFile(pathFile, (err, file) => {
										try{
											if(err) {
												throw err;
											} else {
												res.writeHead(200, {'Content-Type': 'application/octet-stream'});
												res.end(file);
											}
										} catch(e) {
											res.writeHead(404, {'Content-Type': 'text/plain'});
											res.end('Not Found');
											console.log(colors.yellow(datetime() + "Неудачный запрос файла " + req.url + " с адреса " + req.connection.remoteAddress));
										}
									});	
								} else if ((serverStorage.getState().admins[username] === password) && (typeof(serverStorage.getState().admins[username]) !== 'undefined')) { 
									if (req.url === '/upload' && req.method === 'POST') {									
										var form = new multiparty.Form();
										form.parse(req, function(err, fields, files) {
											try{
												if(err){
													throw err;
												} else {
													var FilesNull = true;
													for(var keyFile in files){
														FilesNull = false;
														fs.copyFile(files[keyFile][0].path, './files/' + keyFile, (err) => {
															try{
																if (err) {
																	throw err;
																} else{
																	res.writeHead(200, {'content-type': 'text/plain'});
																	res.end('upload');
																	console.log(colors.green(datetime() + "Пользователем " + username + ' с адреса ' + req.connection.remoteAddress + ' загружен файл ./files/' + keyFile));
																}
															} catch(e){
																res.writeHead(500, {'Content-Type': 'text/plain'});
																res.end('Internal Server Error');
																console.log(colors.red(datetime() + "Ошибка копирования входящего файла!"));
															}
														}); 
													}
													if(FilesNull){
														res.writeHead(500, {'Content-Type': 'text/plain'});
														res.end('Internal Server Error');
														console.log(colors.red(datetime() + "Файлы не получены!"));
													}
												}
											} catch(e) {
												res.writeHead(500, {'Content-Type': 'text/plain'});
												res.end('Internal Server Error');
												console.log(colors.red(datetime() + "Ошибка обработки formdata на file-сервере!"));
											}
										}); 
										return;
									} else {
										res.writeHead(500, {'Content-Type': 'text/plain'});
										res.end('Internal Server Error');
										console.log(colors.red(datetime() + "Некорректный запрос на file-сервер!"));
									}							
								}else {
									res.statusCode = 401;
									res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
									res.end('Permission denied');
									connectionStorage.dispatch({type:'WRONG_PASS', payload: {address:replacer(req.connection.remoteAddress, true)}});
									console.log(colors.red(datetime() + "Попытка подключения к file-серверу с неверным паролем с адреса " + req.connection.remoteAddress));
								}
							} catch(e){
								res.writeHead(500, {'Content-Type': 'text/plain'});
								res.end('Internal Server Error');
								console.log(colors.red(datetime() + "Ошибка проверки пароля для доступа к file-серверу!"));
							}
						}
					} catch (e){
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.end('Internal Server Error');
						console.log(colors.red(datetime() + "Ошибка обработки запроса на file-сервере:" + e));
					}
				}
			} catch(e){
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end('Internal Server Error');
				console.log(colors.red(datetime() + "Ошибка работы file-сервера:" +e));
			}
		};
		if(SslOptions !== 'error'){ 
			var server = https.createServer(SslOptions, webserverfunc).listen(port, '0.0.0.0');
			console.log(colors.gray(datetime() + 'https-fileserver-server listening on *:' + port));
		} else {
			var server = http.createServer(webserverfunc).listen(port, '0.0.0.0');
			console.log(colors.gray(datetime() + 'http-fileserver-server listening on *:' + port));
		}
		server.maxHeadersCount = fileConnLimit;
		server.timeout = 120000;
	} catch (e){
		console.log(colors.red(datetime() + "Не могу запустить file-сервер!"));
	}
}

//функция очистки хранилища
function GarbageCollector(){
	var lifetime = 86400000 * 10; //устанавливаю срок хранения выполненых задач в 10 дней
	var lifetimetwo = 86400000 * 100; //устанавливаю срок хранения задач в 100 дней
	var actualStorage = serverStorage.getState();
	var bannedStorage = connectionStorage.getState().iptoban;
	try{
		try{
			for(var key_object in actualStorage.tasks){
				try{
					if(typeof(actualStorage.users[key_object]) === 'undefined'){
						serverStorage.dispatch({type:'GC_USER', payload: {user:key_object}});
						console.log(colors.yellow(datetime() + "Найдены задания для несуществующего объекта (" + replacer(key_object, false) + "), удаляю!"));
					} else {
						for(var key_task in actualStorage.tasks[key_object]){
							try {
								if((actualStorage.tasks[key_object][key_task].complete == 'true') && (actualStorage.tasks[key_object][key_task].datetime < (Date.now()-lifetime))){
									serverStorage.dispatch({type:'GC_TASK', payload: {user:key_object, task:key_task}});
									console.log(colors.yellow(datetime() + "Найдены выполненые задания с истекшим сроком (" + key_task + "), удаляю!"));
								} else if(actualStorage.tasks[key_object][key_task].datetime < (Date.now()-lifetimetwo)){
									serverStorage.dispatch({type:'GC_TASK', payload: {user:key_object, task:key_task}});
									console.log(colors.yellow(datetime() + "Найдены задания старше 100 дней (" + key_task + "), удаляю!"));
								}
							} catch (e){
								console.log(colors.red(datetime() + "Ошибка обработки задания " + key_task + " в объекте "  + replacer(key_object, false) + " сборщиком мусора!"));
							}
							try {
								if(actualStorage.tasks[key_object][key_task].answer.length > 503){
									serverStorage.dispatch({type:'GC_TASK_REPLANSW', payload: {user:key_object, task:key_task}});
									console.log(colors.yellow(datetime() + "Найден слишком длинный ответ в задании " + key_task + "(" + replacer(key_object, false) + "), обрезаю!"));
								}
							} catch(e){
								console.log(colors.red(datetime() + "Ошибка обрезки ответа для задания " + key_task + " в объекте "  + replacer(key_object, false) + " сборщиком мусора!"));
							}
						}
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка обработки объекта "  + replacer(key_object, false) + " сборщиком мусора!"));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка обработки сборщиком мусора постоянного хранилища: "  + e));
		}
		try {
			for(var key_ipaddr in bannedStorage){
				try {
					if(typeof(bannedStorage[key_ipaddr]) === 'object'){
						if(typeof(bannedStorage[key_ipaddr].datetime) !== 'undefined'){
							if((bannedStorage[key_ipaddr].datetime + bantimeout) < Date.now()){
								connectionStorage.dispatch({type:'GC_WRONG_PASS_CLEAR', payload: {address:key_ipaddr}});
							}
						}
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка обработки IP адреса "  + replacer(key_ipaddr, false) + " сборщиком мусора!"));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка обработки сборщиком мусора хранилища соединений: "  + e));
		}
		try{
			fs.readdir('./files/', function(err, items) {
				try{
					if (err) {
						throw err;
					} else {
						for (var i=0; i<items.length; i++) {
							try {
								var unlink = true;
								for(var key_object in actualStorage.tasks){
									if(typeof(actualStorage.tasks[key_object][items[i]]) !== 'undefined'){
										unlink = false;
									}
								}
								if(unlink){
									try{
										fs.unlinkSync('./files/'+items[i]);
										console.log(colors.yellow(datetime() + "Cборщиком мусора удален файл "  + items[i] + ' !'));
									} catch(e){
										console.log(colors.red(datetime() + "Ошибка удаления сборщиком мусора файла "  + items[i] + ' !'));
									}
								}
							}catch(e){
								console.log(colors.red(datetime() + "Ошибка обработки сборщиком мусора файла "  + items[i] + ' !'));
							}
						}
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами: "  + e));
				}
			});
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка обработки сборщиком мусора хранилища файлов: "  + e));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Неустранимая ошибка в работе сборщика мусора: "  + e));
	}
}

//функция генерации отчетов по таскам
function GenerateReport(){
	try {
		var tempStorage = serverStorage.getState().tasks;
		var reportStore = {};
		var reportSortStore = {};
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
						if(typeof(tempStorage[keyObject][keyTask].datetime) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].datetime = tempStorage[keyObject][keyTask].datetime;
						}
						if(typeof(tempStorage[keyObject][keyTask].timeoncompl) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].datetimeout = (new Date(tempStorage[keyObject][keyTask].timeoncompl)).getTime();
						}
						if(typeof(tempStorage[keyObject][keyTask].tryval) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].tryval = tempStorage[keyObject][keyTask].tryval;
							if(typeof(reportStore[keyTask].errors) !== 'number'){
								reportStore[keyTask].errors = 0;
							}
							if(tempStorage[keyObject][keyTask].tryval === 100){
								reportStore[keyTask].errors = reportStore[keyTask].errors + 1;
							}
						}
						if(typeof(tempStorage[keyObject][keyTask].datetimecompl) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].datetimecompl = tempStorage[keyObject][keyTask].datetimecompl;
						}
						if(typeof(tempStorage[keyObject][keyTask].complete) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].complete = tempStorage[keyObject][keyTask].complete;
						}
						if(typeof(tempStorage[keyObject][keyTask].answer) !== 'undefined'){
							reportStore[keyTask].objects[keyObject].answer = tempStorage[keyObject][keyTask].answer;
						}
						if(typeof(tempStorage[keyObject][keyTask].datetime) !== 'undefined'){
							reportStore[keyTask].datetime = tempStorage[keyObject][keyTask].datetime;
						}
						switch(tempStorage[keyObject][keyTask].nameTask){
							case 'getFileFromWWW':
								reportStore[keyTask].text = "Скачать файл " + tempStorage[keyObject][keyTask].extLink + " в " + tempStorage[keyObject][keyTask].intLink + tempStorage[keyObject][keyTask].fileName;
								break;
							case 'execFile':
								var thisparams = '';
								if(typeof(tempStorage[keyObject][keyTask].paramArray) === 'object'){
									thisparams = tempStorage[keyObject][keyTask].paramArray.join(' ');
								}
								reportStore[keyTask].text = "Запустить скрипт " + tempStorage[keyObject][keyTask].intLink + tempStorage[keyObject][keyTask].fileName + ' ' + thisparams;
								break;
							case 'execCommand':
								reportStore[keyTask].text = "Выполнить команду " + tempStorage[keyObject][keyTask].execCommand;
								break;
						}
						var thisdependencies = '';
						if(typeof(tempStorage[keyObject][keyTask].dependencies) === 'object'){
							thisdependencies = tempStorage[keyObject][keyTask].dependencies.join(' ');
						}
						reportStore[keyTask].dependencies = thisdependencies;
						if(typeof(tempStorage[keyObject][keyTask].comment) !== 'undefined'){
							reportStore[keyTask].comment = tempStorage[keyObject][keyTask].comment;
						}
					} catch(e){
						console.log(colors.red(datetime() + "Не обработан таск " + keyTask + " для " + keyObject + " при генерации отчета!"));
					}
				}
			} catch(e){
				console.log(colors.red(datetime() + "Ошибка генерации отчета по таскам для " + keyObject + "!"));
			}
		}
		connectionStorage.dispatch({type:'GEN_REPORT', payload: {report:sortObjectFunc(reportStore, 'datetime', 'integer', true)}});
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка генерации отчетов по таскам!"));
	}
}

//функция генерации груп
function GenerateGroup(){
	try{
		var tempStorage = serverStorage.getState().users;
		var groupStorage = {};
		groupStorage['all'] = [];
		for(var keyObject in tempStorage){
			try{
				var replaceKeyObject = replacer(keyObject, false);
				var groupNameArr = replaceKeyObject.split('.');
				var groupName = groupNameArr[0];
				if(typeof(groupStorage[groupName]) === 'undefined'){
					groupStorage[groupName] = [];
				}
				groupStorage[groupName].push(replaceKeyObject);
				groupStorage['all'].push(replaceKeyObject);
			} catch(e){
				console.log(colors.red(datetime() + "Ошибка добавления пользователя " + keyObject + " в группы!"));
			}
		}
		connectionStorage.dispatch({type:'GEN_GROUP', payload: {groups:sortObjectFunc(groupStorage, '', 'string', false)}});
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка генерации групп пользователей: " + e));
	}
}

//функция сортировки объекта по полю
function sortObjectFunc(ObjectForSort, KeyForSort, TypeKey, reverse){
	try{
		var SortObject = new Object,
			tempObject = new Object,
			tempArray = new Array,
			validaterone = 0,
			validatertwo = 0;
		
		for(var keyobject in ObjectForSort) { //проходим по всем ключам родителям объекта
			if(KeyForSort !== ''){
				if(typeof(ObjectForSort[keyobject][KeyForSort]) !== 'undefined'){ //проверяем что ключ потомок существует
					tempObject[ObjectForSort[keyobject][KeyForSort]] = keyobject; //создаем объект связку ключа потомка и ключа родителя
					tempArray.push(ObjectForSort[keyobject][KeyForSort]); //создаем массив ключей потомков
				}
			} else {
				tempArray.push(keyobject); //создаем массив ключей
			}
			validaterone++; //считаем число ключей объекта, чтобы потом сравнить с длинной массива
		}
		
		function sortNumber(a,b) { //сортируем массив в зависимости от переданного типа
			return a - b;
		}
		if(TypeKey === 'integer'){
			tempArray.sort(sortNumber);
		} else {
			tempArray.sort();
		}
		
		if(reverse){  //если задан параметр, то переворачиваем массив
			tempArray.reverse();
		}
		
		for(var i=0; i<tempArray.length; i++){ //проходим по отсортированному массиву ключей потомков
			if(KeyForSort !== ''){
				SortObject[tempObject[tempArray[i]]] = ObjectForSort[tempObject[tempArray[i]]]; //используем объект связку и старый объект, чтобы получить новый отсортированный объект
			} else {
				SortObject[tempArray[i]] = ObjectForSort[tempArray[i]];
			}
		}
		
		if(KeyForSort !== ''){ //учитываем, что для первого уровня валидация не нужна, т.к. не используется объект связка, где могли быть затерты одинаковые ключи
			for(var keyobject in SortObject){
				validatertwo++; //считаем число ключей нового объекта
			}
		}
		
		if((validaterone === validatertwo) || (KeyForSort === '')){ //если количество ключей не изменилось - выводим новый объект.
			return SortObject;
		} else {
			return ObjectForSort;
		}
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка переиндексации ключей объекта!"));
		return ObjectForSort;
	}
}



/* ### Раздел работы с сокетом ### */
try {
	getSettings().then(function(value){
		//загружаем файл конфигурации
		var port = parseInt(value.port, 10),
		webport = parseInt(value.webport, 10),
		fileport = parseInt(value.fileport, 10),
		fileConnLimit = parseInt(value.fileconnlimit, 10);
		firebase_user = value.firebase_user;
		firebase_pass = value.firebase_pass;
		config = value.firebase_config;
		var sslkey = value.sslkey,
		sslcrt = value.sslcrt,
		sslca = value.sslca;
		//отправляем данные о портах в хранилище соединений, чтобы к ним был доступ из панели администрирования
		connectionStorage.dispatch({type:'PARAM_PORTS', payload: {fileportval:fileport}});
		if((typeof(value.bantimeout) !== 'undefined') && (value.bantimeout !== '')){
			bantimeout = parseInt(value.bantimeout, 10);
		}
		if((typeof(sslkey) !== 'undefined') && (sslkey !== '') && (typeof(sslcrt) !== 'undefined') && (sslcrt !== '') && (typeof(sslca) !== 'undefined') && (sslca !== '')) {
			SslOptions = {
				key: fs.readFileSync(sslkey),
				cert: fs.readFileSync(sslcrt) + '\n' + fs.readFileSync(sslca)
			};
		} else {
			SslOptions = 'error';
		}
		
		firebase.initializeApp(config);
		
		//грузим данные из firebase в redux при старте, если они не null
		var Initialize = new Promise(function(resolve){
			AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
				if(value === 'auth'){
					GetFirebaseData().then(function(value_child){
						if(value_child !== 'null'){
							try{
								var value_child_obj = JSON.parse(value_child);
								if(typeof(value_child_obj.users) === 'undefined'){
									value_child_obj.users = {};
								}
								if(typeof(value_child_obj.tasks) === 'undefined'){
									value_child_obj.tasks = {};
								}
								if(typeof(value_child_obj.admins) === 'undefined'){
									value_child_obj.admins = {'administrator':'61d8c6ba173c4764d9a4aca45dc6faa0294bb4d7a95f204e1b8bc139cafaa6f6'}; //логин: administrator, пароль: 12345678 (по умолчанию при создании БД)
								}
								if((typeof(value_child_obj.users) !== 'undefined') && (typeof(value_child_obj.tasks) !== 'undefined') && (typeof(value_child_obj.admins) !== 'undefined')){
									serverStorage.dispatch({type:'SYNC', payload: value_child_obj});
								} else {
									console.log(colors.yellow(datetime() + "Один из обязательных аргументов отсутствует в firebase, база данных будет пересоздана."));
								}
							} catch(e){
								console.log(colors.red(datetime() + "Повреждение firebase, не могу корректно распарсить полученный объект:" + e));
								value_child_obj = {users:{},tasks:{},admins:{'administrator':'61d8c6ba173c4764d9a4aca45dc6faa0294bb4d7a95f204e1b8bc139cafaa6f6'}};
								serverStorage.dispatch({type:'SYNC', payload: value_child_obj});
							}
						} else {
							console.log(colors.yellow(datetime() + "Проблема с firebase, полученный снимок является пустым. Firebase будет перезаписана!"));
							value_child_obj = {users:{},tasks:{},admins:{'administrator':'61d8c6ba173c4764d9a4aca45dc6faa0294bb4d7a95f204e1b8bc139cafaa6f6'}};
							serverStorage.dispatch({type:'SYNC', payload: value_child_obj});
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
				if(SslOptions !== 'error'){
					server=https.createServer(SslOptions).listen(port, function() {
						console.log(colors.gray(datetime() + 'wss socket-server listening on *:' + port));
					}); 
				} else {
					server=http.createServer().listen(port, function() {
						console.log(colors.gray(datetime() + 'ws socket-server listening on *:' + port));
					}); 
				}
				server.maxHeadersCount = 100000;
				server.timeout = 120000;
				io=socketio.listen(server, { log: true ,pingTimeout: 3600000, pingInterval: 25000, transports:["websocket"]});
				io.sockets.on('connection', function (socket) {
					try {
						var thisSocketAddressArr = io.sockets.sockets[socket.id].handshake.address.split(':');
						var thisSocketAddress = thisSocketAddressArr[thisSocketAddressArr.length-1];
						if(typeof(connectionStorage.getState().iptoban) === 'object'){
							if(typeof(connectionStorage.getState().iptoban[replacer(thisSocketAddress, true)]) === 'object') {
								var ThisSocketAttemp = connectionStorage.getState().iptoban[replacer(thisSocketAddress, true)].attemp;
								var ThisSocketDatetime = connectionStorage.getState().iptoban[replacer(thisSocketAddress, true)].datetime;
							}
						}
						if(typeof(ThisSocketAttemp) !== 'number'){
							ThisSocketAttemp = 0;
						}
						if(typeof(ThisSocketDatetime) !== 'number'){
							ThisSocketDatetime = 0;
						}
						if((ThisSocketAttemp > 5) && ((ThisSocketDatetime + bantimeout) > Date.now())){
							console.log(colors.red(datetime() + 'Попытка входа с заблокированного адреса ' + thisSocketAddress));
							socket.disconnect();
						} else {
							io.sockets.sockets[socket.id].emit('initialize', { value: 'whois' });
							io.sockets.sockets[socket.id].on('login', function (data) {
								if(testUser(data.user, data.password, socket.id)) {
									try {
										try{
											if(typeof(connectionStorage.getState().users[replacer(data.user, true)]) !== 'undefined'){
												io.sockets.sockets[connectionStorage.getState().users[replacer(data.user, true)]].disconnect();
											}
										} catch(e){
											console.log(colors.red(datetime() + "Ошибка закрытия сокета: " + e));
										}
										io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
										setUser(data.user, 'uid', socket.id);
										console.log(colors.green(datetime() + "Подключение пользователя\nLogin: " + data.user + "\nUID: " + socket.id + "\nADDRESS:" + thisSocketAddress));
										io.sockets.sockets[socket.id].emit('sendtask', serverStorage.getState().tasks[replacer(data.user, true)]);
										io.sockets.sockets[socket.id].on('completetask', function (data) {
											serverStorage.dispatch({type:'COMPLETE_TASK', payload: {user:connectionStorage.getState().uids[socket.id], task:data.uid, answer:data.answer, tryval:data.tryval}});
										});
									} catch (e) {
										console.log(colors.red(datetime() + "Ошибка взаимодействия с пользователем " + data.user +": " + e));
									}
								} else if(testAdmin(data.user, data.password, socket.id)) {
									try {
										try{
											if(typeof(connectionStorage.getState().users[replacer(data.user, true)]) !== 'undefined'){
												io.sockets.sockets[connectionStorage.getState().users[replacer(data.user, true)]].disconnect();
											}
										} catch(e){
											console.log(colors.red(datetime() + "Ошибка закрытия сокета: " + e));
										}
										io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
										setUser(data.user, 'uid', socket.id);
										console.log(colors.green(datetime() + "Подключение администратора\nLogin: " + data.user + "\nUID: " + socket.id + "\nADDRESS:" + thisSocketAddress));
										sendStorageToWeb(io, 'all');
										io.sockets.sockets[socket.id].on('adm_setUser', function (data) {
											if(typeof(data) === 'object'){
												if((typeof(data[0]) === 'string') && (data[0] !== "") && (typeof(data[1]) === 'string') && (data[1] !== "")){
													setUser(data[0], 'password', data[1]);
												}
											}
										});
										io.sockets.sockets[socket.id].on('adm_setAdmin', function (data) {
											if(typeof(data) === 'object'){
												if((typeof(data[0]) === 'string') && (data[0] !== "") && (typeof(data[1]) === 'string') && (data[1] !== "")){
													setAdmin(data[0], 'password', data[1]);
												}
											}
										});
										io.sockets.sockets[socket.id].on('adm_setTask', function (data) {
											if(typeof(data) === 'object'){
												if((typeof(data[0]) === 'string') && (data[0] !== "") && (typeof(data[1]) === 'object')){
													setTask(data[0],data[1]);
													try {
														var ReplaceUserName = replacer(data[0], true);
														if(typeof(connectionStorage.getState().users[ReplaceUserName]) !== 'undefined'){
															var SocketUserId = connectionStorage.getState().users[ReplaceUserName];
															if(typeof(io.sockets.sockets[SocketUserId])  !== 'undefined'){
																io.sockets.sockets[SocketUserId].emit('sendtask', serverStorage.getState().tasks[ReplaceUserName]);
																console.log(colors.green(datetime() + "Задачи пользователю " + data[0] + " отправлены!"));
															} else {
																console.log(colors.red(datetime() + "Пользователь " + data[0] + " не найден в массиве сокетов (рассинхронизация с хранилищем соединений)."));
															}
														} else {
															console.log(colors.yellow(datetime() + "Пользователь " + data[0] + " не найден в хранилище соединений (не подключен). Отправка будет произведена после подключения."));
														}
													} catch(e){
														console.log(colors.red(datetime() + "Не могу отправить задание в сокет:" + e));
													}
												}
											}
										});
										io.sockets.sockets[socket.id].on('adm_delUser', function (data) {
											if(typeof(data) === 'object'){
												if((typeof(data[0]) === 'string') && (data[0] !== "")){
													serverStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
													connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
												}
											}
										});
										io.sockets.sockets[socket.id].on('adm_delAdmin', function (data) {
											if(typeof(data) === 'object'){
												if((typeof(data[0]) === 'string') && (data[0] !== "")){
													serverStorage.dispatch({type:'REMOVE_ADMIN', payload: {user:data[0]}});
													connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:data[0]}});
												}
											}
										});
									} catch (e) {
										console.log(colors.red(datetime() + "Ошибка взаимодействия с администратором " + data.user +": " + e));
									}
								} else {
									io.sockets.sockets[socket.id].emit('authorisation', { value: 'false' });
									socket.disconnect();
									console.log(colors.red(datetime() + "Неверный пароль для пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
									connectionStorage.dispatch({type:'WRONG_PASS', payload: {address:replacer(thisSocketAddress, true)}});
								} 
							});
						  
							socket.on('disconnect', function () {
								connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socket.id}});
								console.log(colors.red(datetime() + "Отключение пользователя\nLogin: " + replacer(connectionStorage.getState().uids[socket.id], false) + "\nUID: " + socket.id));
							}); 
						}
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
		//запускаю файловый сервер
		startFileServer(fileport);
		//запускаю сборщик мусора раз в час
		setInterval(GarbageCollector,3600000);
	}, function(error){
		console.log(colors.red(datetime() + "Инициализация сервера не выполнена по причине: " + error));
	});
} catch (e){
	console.log(colors.red(datetime() + "Не могу загрузить конфигурацию сервера!"));
}