/**
		IoCommander */ const CommanderVersion = '1.1.4'; /**
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

/* ### Раздел инициализации ### */
const fs=require("fs"),
colors=require("colors"),
cryptojs=require("cryptojs"),
os = require("os"),
child_process = require("child_process"),
redux=require("redux"),
lodash=require("lodash"),
socketclient = require('socket.io-client'),
http = require('http'),
https = require('https'),
url = require('url'),
mkdirp = require('mkdirp'),
iconv = require('iconv-lite');
var user_global, password_global, server_global, socket;
var SyncDatabaseTimeout = false;

getSettings().then(function(value){
	if(value !== 'error'){
		user_global = value.login; 
		password_global = cryptojs.Crypto.SHA256(user_global + value.password+'icommander');
		server_global = value.server;
		var protocol_val = value.protocol,
		port_val = value.port;
		
		getDatabase().then(function (database){
			if(database !== 'error'){
				clientStorage.dispatch({type:'DB_SYNC', payload: database});
				console.log(colors.green(datetime() + "Синхронизация с базой данных выполнена!"));
			} else {
				console.log(colors.red(datetime() + "Синхронизация с базой данных не выполнена!"));
			}
			Reconnect(protocol_val, server_global, port_val);
			//очищаем задания, во время которых служба была остановлена
			fs.readdir('./temp/', function(err, items) {
				try{
					if (err) { 
						throw err;
					} else {
						for(var k = 0 ; k < items.length; k++){
							try {
								var thisuid = items[k].substr(0,items[k].length-5);
								taskOnComplete(socket, thisuid, 'Во время выполнения команды служба была остановлена!', 100);
								unlinkLockFile(thisuid);
								console.log(colors.yellow(datetime() + "Отменяю задачу " + thisuid + "!"));
							} catch(e){
								console.log(colors.red(datetime() + "Ошибка обработки файла блокировки " + items[k] + ": " + e));
							}
						}
						//проверяем задания каждые 15 сек
						setInterval(function(){
							try {
								var data_val = clientStorage.getState().tasks;
								if(typeof(data_val) === 'object'){
									try{
										if (err) { 
											throw err;
										} else {
											for(var key_val in data_val){
												try {
													if(typeof(data_val[key_val].timeoncompl) === 'undefined'){
														data_val[key_val].timeoncompl = 0;
													}
													if((data_val[key_val].complete !== 'true') && (testLockFile(key_val)) && (clientStorage.getState().complete.indexOf(key_val) === -1) &&  (data_val[key_val].timeoncompl < Date.now())){
														try {
															var flag = true;
															if(Array.isArray(data_val[key_val].dependencies)){
																for(var i = 0; i < data_val[key_val].dependencies.length; i++ ){
																	if(clientStorage.getState().incomplete.indexOf(data_val[key_val].dependencies[i]) !== -1){
																		flag = false;
																	}
																}
															}
															if(flag){
																console.log(colors.yellow(datetime() + "Найдено новое актуальное задание: " + key_val));
																createLockFile(key_val);
																runTask(socket, key_val, data_val).then(function(value){
																	unlinkLockFile(value.uid);
																}, function(error){
																	unlinkLockFile(key_val);
																});
															}
														} catch (e) {
															console.log(colors.red(datetime() + "Не могу обработать зависимости задания: " + e));
														}
													}
												} catch(e){
													console.log(colors.red(datetime() + "Ошибка выполнения задания: " + e));
												}
											}
										}
									} catch(e){
										console.log(colors.red(datetime() + "Ошибка чтения директории с файлами блокировки: "  + e));
									}
								} else {
									console.log(colors.red(datetime() + "Хранилище заданий не является объектом!"));
								}
							} catch(e){
								console.log(colors.red(datetime() + "Не могу получить список заданий из хранилища!"));
							}
						}, 15000);
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка чтения директории с файлами блокировки: "  + e));
				}
			});
			//запускаю сборщик мусора каждый час
			setInterval(GarbageCollector, 3600000);
		});
	}
}, function(error){
	console.log(colors.red(datetime() + "Ошибка инициализации!"));
});



/* ### Хранилище состояний ### */
var clientStorage = redux.createStore(editStore);
function editStore(state = {tasks: {}, complete: [], incomplete:[]}, action){
	try {
		switch (action.type){
			case 'ADD_TASK':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid] = action.payload.task;
				return state_new;
				break;
			case 'TASK_COMPLETE':
				var state_new = lodash.clone(state);
				if((typeof(action.payload.answer) !== 'undefined') && (action.payload.answer !== '')){
					state_new.tasks[action.payload.uid].answer = action.payload.answer;
				}
				state_new.tasks[action.payload.uid].complete = 'true';
				if(clientStorage.getState().complete.indexOf(action.payload.uid) === -1){
					state_new.complete.push(action.payload.uid);
				}
				if(clientStorage.getState().incomplete.indexOf(action.payload.uid) !== -1){
					state_new.incomplete.splice(clientStorage.getState().incomplete.indexOf(action.payload.uid),1);
				}
				return state_new;
				break;
			case 'TASK_INCOMPLETE':
				var state_new = lodash.clone(state);
				if(clientStorage.getState().incomplete.indexOf(action.payload.uid) === -1){
					state_new.incomplete.push(action.payload.uid);
				}
				if(clientStorage.getState().complete.indexOf(action.payload.uid) !== -1){
					state_new.complete.splice(clientStorage.getState().complete.indexOf(action.payload.uid),1);
				}
				return state_new;
				break;
			case 'TASK_ERROR':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].tryval = state.tasks[action.payload.uid].tryval + 1;
				return state_new;
				break;
			case 'DB_SYNC':
				var state_new = action.payload;
				return state_new;
				break;
			case 'DB_CLEAR_TASK':
				var state_new = lodash.clone(state);
				delete state_new.tasks[action.payload.uid];
				console.log(colors.yellow(datetime() + "Удаляю задание с истекшим сроком: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_COMPL':
				var taskid = state.complete.indexOf(action.payload.uid);
				var state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.complete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива complete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_INCOMPL':
				var taskid = state.incomplete.indexOf(action.payload.uid);
				var state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.incomplete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива incomplete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_REPLANSW_TASK':
				var state_new = lodash.clone(state);
				var thisanswr = state.tasks[action.payload.uid].answer;
				state_new.tasks[action.payload.uid].answer = '...' + thisanswr.substring(thisanswr.length - 1001,thisanswr.length - 1);
				return state_new;
				break;
			case 'FORCE_ERROR':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].tryval = 100;
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

clientStorage.subscribe(function(){
	if(!SyncDatabaseTimeout){ //проверяем что флаг ожидания синхронизации еще не установлен 
		SyncDatabaseTimeout = true; //установим флаг, что в хранилище есть данные ожидающие синхронизации
		setTimeout(setDatabase,15000); //синхронизируем хранилище через минуту (т.е. запрос не будет чаще, чем раз в минуту)
	}
});



/* ### Раздел функций ### */
//функция пересоединения с сокетом 
function Reconnect(protocol_val, server_val, port_val){
	try {
		if(typeof(socket) !== 'undefined'){
			try{
				socket.disconnect();
			}catch(e){
				console.log(colors.red(datetime() + "Не могу уничтожить сокет!"));
			}
		} 
		if(protocol_val === 'https'){
			socket = socketclient.connect(protocol_val + '://' + server_val + ':' + port_val, {secure:true, transports: ['websocket']});
		} else {
			socket = socketclient.connect(protocol_val + '://' + server_val + ':' + port_val, {transports: ['websocket']});
		}
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
				setTimeout(Reconnect, 300000, protocol_val, server_val, port_val);
			}
		});
		//слушаем сокет
		listenSocket(socket, protocol_val, server_val, port_val);
	}catch(e){
		console.log(colors.red(datetime() + "Ошибка подключения к сокету: " + e));
		setTimeout(Reconnect, 300000, protocol_val, server_val, port_val);
	}
}

//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		try {
			fs.readFile("./src-user/iocommander-usr.conf", "utf8", function(error,data){
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

//функция чтения базы данных
function getDatabase(){
	return new Promise(function (resolve){
		try {
			fs.readFile("./src-user/storage.db", "utf8", function(error,data){
				try {	
					if(error) {
						throw error;
					} else {
						resolve(JSON.parse(data));
					}
				} catch(e){
					console.log(colors.red(datetime() + "База данных испорчена!"));
					resolve('error');
				}
			});
		} catch (e) {
			console.log(colors.red(datetime() + "База данных недоступна!"));
			resolve('error');
		}
	});
}

//функция записи в базу данных
function setDatabase(){
	try {
		var resultFs = fs.writeFileSync('./src-user/storage.db', JSON.stringify(clientStorage.getState()), (err) => {
			try{
				if (err) throw err;
			} catch(e){
				console.log(colors.red(datetime() + "Проблема записи в базу данных!"));
				setTimeout(setDatabase,15000); //при ошибке запустим саму себя через минуту
				return;
			}
		});
		if(typeof(resultFs) === 'undefined'){
			SyncDatabaseTimeout = false; //вернем начальное состояние флагу синхронизации
			console.log(colors.green(datetime() + "Синхронизация с базой данных выполнена!"));
			return;
		};
	} catch (e) {
		console.log(colors.red(datetime() + "База данных недоступна!"));
		setTimeout(setDatabase,15000); //при ошибке запустим саму себя через минуту
		return;
	}
}

//функция авторизации в сокете
function login(socket) {
	try {
		if(typeof(socket) === 'object'){
			socket.emit('login', { user: user_global, password: password_global, version: CommanderVersion });
		} else {
			console.log(colors.red(datetime() + "Аргумент сокет не является объектом!"));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Сокет не инициализирован!"));
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

//функция работы с сокетом
function listenSocket(socket, protocol_val, server_val, port_val){
	try {
		socket.on('sendtask', function (data) {
			try {
				console.log(colors.green(datetime() + "Получаю задания!"));
				if(typeof(data) === 'object'){
					for(var key in data){
						try {
							if(typeof(clientStorage.getState().tasks[key]) === 'undefined'){
								clientStorage.dispatch({type:'ADD_TASK', payload: {uid:key, task:data[key]}});
							}
							if(data[key].complete === 'true'){
								if(clientStorage.getState().complete.indexOf(key) === -1){
									clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:key}});
								}
							} else {
								if(clientStorage.getState().complete.indexOf(key) === -1){
									if(clientStorage.getState().incomplete.indexOf(key) === -1){
										clientStorage.dispatch({type:'TASK_INCOMPLETE', payload: {uid:key}});
									}
								} else {
									taskOnComplete(socket, key, clientStorage.getState().tasks[key].answer);
								}
							}
						} catch (e) {
							console.log(colors.red(datetime() + "Не могу добавить задачу в хранилище!"));
						}
					}
				} else {
					console.log(colors.red(datetime() + "Полученные задания должны являться объектом!"));
				}
			} catch(e){
				console.log(colors.red(datetime() + "Неустранимая проблема получения заданий:" + e));
			}
		});
		socket.on('disconnect', () => {
			console.log(colors.red(datetime() + "Соединение разорвано!"));
		});
	} catch (e){
		console.log(colors.red(datetime() + "Проблема прослушки открытого сокета!"));
	}
}

//функция записи в файловую систему, работаем только с корнем (для win32 диском C)
function writeFile(socket, uid_val, extPath, intPath, fileName, platform){
	return new Promise(function(resolve){
		try {
			if((platform === 'all') || (platform === os.platform())){
				switch (os.platform()) {
					case "win32":
						intPath = 'c:' + intPath;
						var options = {
							directory: intPath.replace(/\\/gi, '/'),
							filename: fileName,
							timeout: 60000
						};
						var errors = 0;
						download(extPath, options, function(error){
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									taskOnComplete(socket, uid_val, 'Файл скачан!');
									console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(e) {
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var options = {
							directory: intPath.replace(/\\/gi, '/'),
							filename: fileName,
							timeout: 60000
						};
						var errors = 0;
						download(extPath, options, function(error){
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									taskOnComplete(socket, uid_val, 'Файл скачан!');
									console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(e) {
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve({type:"error",uid:uid_val});
								return;
							}
						});
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve({type:"error",uid:uid_val});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e) {
			console.log(colors.red(datetime() + "Не могу скачать файл в директорию, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}

//функция запуска исполняемого файла, работаем только с корнем (для win32 диском C)
function execFile(socket, uid_val, intPath, fileName, paramArray, platform){
	return new Promise(function(resolve){
		try {
			if((platform === 'all') || (platform === os.platform())){
				switch (os.platform()) {
					case "win32":
						if (intPath !== ""){
							intPath = 'c:' + intPath;
						}
						var errors = 0;
						var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, {encoding:'cp866'}, (error, stdout, stderr) => {
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											switch(fileName.toLowerCase()){
												case 'powershell':
													returnAnswer = 'Результат: ' + fixPowerShellWIN1251(stdout) + ' \n ' + 'Ошибок: ' + fixPowerShellWIN1251(stderr);
													break;
												default:
													returnAnswer = 'Результат: ' + (stdout) + ' \n ' + 'Ошибок: ' + (stderr);
													break;
											}
										} else {
											switch(fileName.toLowerCase()){
												case 'powershell':
													returnAnswer = 'Ошибки: ' + fixPowerShellWIN1251(stderr);
													break;
												default:
													returnAnswer = 'Ошибки: ' + (stderr);
													break;
											}
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										switch(fileName.toLowerCase()){
											case 'powershell':
												returnAnswer = 'Результат: ' + fixPowerShellWIN1251(stdout);
												break;
											default:
												returnAnswer = 'Результат: ' + (stdout);
												break;
										}
									} else {
										returnAnswer = '';
									}
									taskOnComplete(socket, uid_val, returnAnswer);
									console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 10){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, stdoutOEM866toUTF8(error), 100);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + stdoutOEM866toUTF8(error)));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var errors = 0;
						fs.chmod((intPath.replace(/\\/gi, '/') + fileName), 0777, (error) =>{
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									var errorsinc = 0;
									var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
										try{
											if (error) {
												throw error;
											} else if(errorsinc === 0){
												if((typeof(stderr) !== 'undefined') && (stderr !== '')){
													if((typeof(stdout) !== 'undefined') && (stdout !== '')){
														returnAnswer = 'Результат: ' + stdout + ' \n ' + 'Ошибок: ' + stderr;
													} else {
														returnAnswer = 'Ошибки: ' + stderr;
													}					
												} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
													returnAnswer = 'Результат: ' + stdout;
												} else {
													returnAnswer = '';
												}
												taskOnComplete(socket, uid_val, returnAnswer);
												console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
												resolve({type:"ok",uid:uid_val});
											}
										} catch(error){
											errorsinc++;
											if(clientStorage.getState().tasks[uid_val].tryval < 10){
												clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
											} else {
												taskOnComplete(socket, uid_val, error, 100);
											}
											console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
											resolve({type:"error",uid:uid_val});
										}
									}); 
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 10){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error, 100);
								}
								console.log(colors.red(datetime() + "Ошибка изменения прав скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve({type:"error",uid:uid_val});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e){
			console.log(colors.red(datetime() + "Не могу запустить файл, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}

//функция запуска shell-команды
function execProcess(socket, uid_val, execCommand, platform){
	return new Promise(function(resolve){
		try{
			if((platform === os.platform()) || (platform === 'all')){
				var errors = 0;
				switch (os.platform()){
					case 'win32':
						var child = child_process.exec(execCommand, {encoding:'cp866'}, (error, stdout, stderr) => {
							try {
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											returnAnswer = 'Результат: ' + stdoutOEM866toUTF8(stdout) + ' \n ' + 'Ошибок: ' + stdoutOEM866toUTF8(stderr);
										} else {
											returnAnswer = 'Ошибок: ' + stdoutOEM866toUTF8(stderr);
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										returnAnswer = 'Результат: ' + stdoutOEM866toUTF8(stdout);
									} else {
										returnAnswer = '';
									}
									taskOnComplete(socket, uid_val, returnAnswer);
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 10){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, stdoutOEM866toUTF8(error), 100);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения команды " + execCommand + ":" + stdoutOEM866toUTF8(error)));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var child = child_process.exec(execCommand, (error, stdout, stderr) => {
							try {
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											returnAnswer = 'Результат: ' + stdout + ' \n ' + 'Ошибок: ' + stderr;
										} else {
											returnAnswer = 'Ошибок: ' + stderr;
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										returnAnswer = 'Результат: ' + stdout;
									} else {
										returnAnswer = '';
									}
									taskOnComplete(socket, uid_val, returnAnswer);
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 10){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error, 100);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения команды " + execCommand + ":" + error));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e){
			if(clientStorage.getState().tasks[uid_val].tryval < 10){
				clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
			} else {
				taskOnComplete(socket, uid_val, e, 100);
			}
			console.log(colors.red(datetime() + "Не могу выполнить команду, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}

//функция изменения состояния при выполнении таска
function taskOnComplete(socket, uid_val, answer_val, forceerr){
	var realAnswer = 'none';
	var TryVal = 0;
	try {
		if((typeof(answer_val) !== 'string') && (typeof(answer_val) !== 'undefined') && (answer_val !== '')){
			realAnswer = answer_val.toString();
		} else if (typeof(answer_val) === 'string'){
			realAnswer = answer_val;
		}
		var replSymbol = [' ', '-', '.', '#']; //символы из псевдографики в консоли (иногда в выводе их может быть пару сотен)
		for(var k = 0; k< replSymbol.length; k++){
			var tempRealAnsw = realAnswer.split(replSymbol[k]);
			var tempRealAnswNew = new Array;
			for(var i = 0; i < tempRealAnsw.length; i++){
				if((tempRealAnsw[i] !== replSymbol[k]) && (tempRealAnsw[i] !== '') && (typeof(tempRealAnsw[i]) === 'string')){
					tempRealAnswNew.push(tempRealAnsw[i]);
				}
			}
			realAnswer = tempRealAnswNew.join(replSymbol[k]);
		}
		if(realAnswer.length > 1003){
			realAnswer =  '...' + realAnswer.substring(realAnswer.length - 1001 ,realAnswer.length - 1);
		}
	} catch (e){}
	try {
		clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:uid_val, answer:realAnswer}});
		console.log(colors.green(datetime() + "Задание " + uid_val + " выполнено!"));
	} catch (e){
		console.log(colors.red(datetime() + "Не могу изменить состояние таска, по причине:" + e));
	}
	try {
		if(typeof(clientStorage.getState().tasks[uid_val].tryval) !== 'undefined'){
			TryVal = clientStorage.getState().tasks[uid_val].tryval;
		}
		if(forceerr === 100){ //принудительно выставляем 100 (ошибку)
			TryVal = 100;
			clientStorage.dispatch({type:'FORCE_ERROR', payload: {uid:uid_val}});
		}
		socket.emit('completetask', { uid: uid_val, answer:realAnswer, tryval: TryVal});
	} catch (e){
		console.log(colors.red(datetime() + "Не могу отправить отчет о задании в сокет, по причине:" + e));		
	}
}

//функция запуска выполнения заданий
function runTask(socket, key, data){
	try {
		if((data[key].complete !== 'true') && (clientStorage.getState().complete.indexOf(key) === -1) && (data[key].timeoncompl < Date.now())) {
			switch (data[key].nameTask){
				case "getFileFromWWW":
					return writeFile(socket, key, data[key].extLink, data[key].intLink, data[key].fileName, data[key].platform);
					break;
				case "execFile":
					return execFile(socket, key, data[key].intLink, data[key].fileName, data[key].paramArray, data[key].platform);
					break;
				case "execCommand":
					return execProcess(socket, key, data[key].execCommand, data[key].platform);
					break;
				default:
					return new Promise(function(resolve){resolve({type:"error",uid:key});});
					break;
			}	
		}
	} catch (e) {
		console.log(colors.red(datetime() + "Не могу выполнить задание, по причине:" + e));
		return new Promise(function(resolve){resolve({type:"error",uid:key});});
	}
}

//функция очистки хранилища
function GarbageCollector(){
	var lifetime = 86400000 * 10; //устанавливаю срок хранения локальных данных в 10 дней
	var actualStorage = clientStorage.getState();
	SyncDatabaseTimeout = false; //сбрасываю флаг синхронизации на всякий случай
	try{
		try{
			for(var keyTask in actualStorage.tasks){
				try{
					if((actualStorage.tasks[keyTask].datetime + lifetime) < Date.now()){ //если у задания нет отсрочки, оно будет уничтожено через 10 дней. если есть отсрочка, то через 10 дней после даты отсрочки.
						if(typeof(actualStorage.tasks[keyTask].timeoncompl) !== 'undefined'){
							if((actualStorage.tasks[keyTask].timeoncompl + lifetime) < Date.now()){
								clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
							} else {
								try{
									if(actualStorage.tasks[keyTask].answer.length > 1003){
										clientStorage.dispatch({type:'DB_REPLANSW_TASK', payload: {uid:keyTask}});
										console.log(colors.yellow(datetime() + "Найден слишком длинный ответ в задании " + keyTask + ", обрезаю!"));
									}
								} catch(e){
									console.log(colors.red(datetime() + "Ошибка обрезки ответа для задания " + keyTask + " сборщиком мусора!"));
								}
							}
						} else {
							clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
						}
					} else {
						try{
							if(actualStorage.tasks[keyTask].answer.length > 1003){
								clientStorage.dispatch({type:'DB_REPLANSW_TASK', payload: {uid:keyTask}});
								console.log(colors.yellow(datetime() + "Найден слишком длинный ответ в задании " + keyTask + ", обрезаю!"));
							}
						} catch(e){
							console.log(colors.red(datetime() + "Ошибка обрезки ответа для задания " + keyTask + " сборщиком мусора!"));
						}
					}
				} catch(e){
					console.log(colors.red(datetime() + "Сборщиком мусора не обработана задача с uid: "  + keyTask));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка прохода сборщиком мусора по таскам: "  + e));
		}
		try{
			for(var i = 0; i < actualStorage.complete.length; i++){
				try {
					var actualUidCompl = actualStorage.complete[i];
					if(typeof(actualStorage.tasks[actualUidCompl]) === 'undefined'){
						clientStorage.dispatch({type:'DB_CLEAR_COMPL', payload: {uid:actualUidCompl}});
					}
				} catch(e){
					console.log(colors.red(datetime() + "Сборщиком мусора в массиве complete не обработан id: "  + i));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка прохода сборщиком мусора по массиву complete: "  + e));
		}
		try{
			for(var j = 0; j < actualStorage.incomplete.length; j++){
				try{
					var actualUidIncompl = actualStorage.incomplete[j];
					if(typeof(actualStorage.tasks[actualUidIncompl]) === 'undefined'){
						clientStorage.dispatch({type:'DB_CLEAR_INCOMPL', payload: {uid:actualUidIncompl}});
					}
				} catch(e){
					console.log(colors.red(datetime() + "Сборщиком мусора в массиве incomplete не обработан id: "  + j));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка прохода сборщиком мусора по массиву incomplete: "  + e));
		}
		try{
			var items = fs.readdirSync('./temp/');
			try {
				if(typeof(items) === 'object'){
					for (var i=0; i<items.length; i++) {
						try {
							var thisuid = items[i].substring(0, items[i].length -5);
							if(typeof(actualStorage.tasks[thisuid]) === 'undefined'){
								unlinkLockFile(thisuid);
							} else {
								if(actualStorage.tasks[thisuid].complete === 'true'){
									unlinkLockFile(thisuid);
								}
							}
						} catch(e){
							console.log(colors.red(datetime() + "Ошибка обработки файла " + items[i] + " сборщиком мусора: "  + e));
						}
					}
				}
			} catch(e){
				console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Неустранимая ошибка в работе сборщика мусора: "  + e));
	}
}

//измененная библиотека download-file для работы с собственным file-сервером
function download(file, options, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
	}
	try{
		if (!file) throw("Need a file url to download");
		options = typeof options === 'object' ? options : {};
		options.timeout = options.timeout || 20000;
		options.directory = options.directory ? options.directory : '.';
		var uri = file.split('/');
		options.filename = options.filename || uri[uri.length - 1];
		var path = options.directory + "/" + options.filename;
		if (url.parse(file).protocol === null) {
			req = http;
		} else if (url.parse(file).protocol === 'https:') {
			req = https;
		} else {
			req = http;
		}
		var getoptions = url.parse(file); 
		if((typeof(server_global) !== 'undefined') && (typeof(user_global) !== 'undefined') && (typeof(password_global) !== 'undefined')){
			if(url.parse(file).hostname === server_global){
				getoptions.auth = user_global + ':' + password_global;
			}
		}
		var request = req.get(getoptions, function(response) {
			if (response.statusCode === 200) {
				mkdirp(options.directory, function(err) {
					try {
						if (err) {
							throw err;
						} else {
							var filestream = fs.createWriteStream(path);
							response.pipe(filestream);
							filestream.on("finish", function(){
								if((typeof(response.headers['content-length']) !== 'undefined') && (response.headers['content-length'] !== '')){
									try {
										var stats = fs.statSync(path);
										if (stats.isFile()) {
											if(stats.size.toString() !== response.headers['content-length']){
												throw 'File not full(down:' + stats.size.toString() + '/' + response.headers['content-length'] + ')!';
											} else {
												if (callback) callback(false, path);
											}
										} else {
											throw 'Not Found';
										}
									}catch(e){
										if (callback) callback(e.toString());
									}
								} else {
									if (callback) callback(false, path);
								} 
							});
							filestream.on("error", function(err){
								request.abort();
								if (callback) callback(err.toString());
							});
						}
					} catch(e){
						if (callback) callback(e.toString());
					}
				});
			} else{
				if (callback) callback(response.statusCode);
			}
			request.setTimeout(options.timeout, function () {
				request.abort();
				if (callback) callback("Timeout");
			});
		}).on('error', function(e) {
			if (callback) callback(e.toString());
		});
	}catch(e) {
		if (callback) callback(e.toString());
	}
}

//функция удаления файла блокировки
function unlinkLockFile(uid_val){
	if(fs.existsSync('./temp/'+uid_val+'.lock')){
		try {
			fs.unlinkSync('./temp/'+uid_val+'.lock');
			console.log(colors.green(datetime() + "Удалена блокировка задачи (" + uid_val + ")!"));
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка удаления файла блокировки: "  + e));
		}
	} else {
		console.log(colors.red(datetime() + "Файл блокировки (" + uid_val+'.lock' + ") не существует!"));
	}
}

//функция создания файла блокировки
function createLockFile(uid_val){
	if(!fs.existsSync('./temp/'+uid_val+'.lock')){
		try {
			fs.writeFileSync('./temp/'+uid_val+'.lock', Date.now());
			console.log(colors.green(datetime() + "Добавлена блокировка задачи (" + uid_val + ")!"));
		} catch(e){
			console.log(colors.red(datetime() + "Не могу записать файл блокировки:" + e));
		}
	} else {
		console.log(colors.red(datetime() + "Файл блокировки (" + uid_val +'.lock' + ") уже существует!"));
	}
}

//функция проверки файла блокировки
function testLockFile(uid_val){
	try {
		return !fs.existsSync('./temp/' + uid_val + '.lock');
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка проверки файла блокировки:" + e));
		return false;
	}
}

//функция декодирования stdout OEM866 в валидный UTF8
function stdoutOEM866toUTF8(value){ //может быть Object или String
	try {
		if(typeof(value) === 'object'){
			if(typeof(value.message) === 'string') {
				value = new Buffer(value.toString('cp866'));
			}
		} else if(typeof(value) === 'string'){
			value = new Buffer(value.toString());
		}
		var thisval = iconv.decode(new Buffer(new Buffer(iconv.decode(value, 'cp866')), 'utf8'), 'utf8'); //для IBM866 stdout
		return thisval;
	} catch(e){
		return 'Error Windows COM Decode String';
	}
}

//функция декодирования вывода powershell (ANSI по умолчанию)
function fixPowerShellWIN1251(value){ //может быть Buffer
	try {
		var thisval = iconv.decode(value, 'cp866');
		return thisval;
	} catch(e){
		return 'Error Windows COM Decode String';
	}
}

//функция перезапуска клиента (запустит дочерний процесс, который перезапустит данный скрипт независимым процессом. в случае удачного запуска текущий процесс будет завершен, а соответственно и дочерний/зависимый процесс)
//нужно с целью экономии памяти (чтобы не вешать еще один контроллирующий процесс на постоянной основе)
function Restarter(){
	var items = fs.readdirSync('./temp/');
	if(items.length === 0) {
		try {
			const subprocess = child_process.spawn(process.argv[0], [__dirname + '/iocom-client-restarter.js'], {
				cwd: process.cwd(),
				env: process.env,
				detached: false
			});
			subprocess.stdout.on('data', (data) => {
				console.log(colors.green(datetime() + data));
				process.exit(1);
			});
			subprocess.stderr.on('data', (data) => {
				console.log(colors.red(datetime() + data));
				subprocess.exit(1); //в случае ошибки убиваем дочерний процесс
			});
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка перезапуска процесса:" + e));
		}
	} else {
		setTimeout(Restarter, 1000);
	};
}

