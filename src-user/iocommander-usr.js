/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/

/* ### Раздел инициализации ### */
const fs=require("fs"),
colors=require("colors"),
cryptojs=require("cryptojs"),
download = require("download-file"),
os = require("os"),
child_process = require("child_process"),
redux=require("redux"),
lodash=require("lodash");
var user_val, password_val;
var SyncDatabaseTimeout = false;

getSettings().then(function(value){
	if(value !== 'error'){
		user_val = value.login; 
		password_val = cryptojs.Crypto.SHA256(user_val + value.password+'icommander');
		if(typeof(socket) !== 'undefined'){
			socket.close();
		}
		var protocol_val = value.protocol,
		server_val = value.server,	
		port_val = value.port,
		socket = require('socket.io-client').connect(protocol_val + '://' + server_val + ':' + port_val);
		getDatabase().then(function (database){
			if(database !== 'error'){
				clientStorage.dispatch({type:'DB_SYNC', payload: database});
				console.log(colors.green(datetime() + "Синхронизация с базой данных выполнена!"));
			} else {
				console.log(colors.red(datetime() + "Синхронизация с базой данных не выполнена!"));
			}
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
					//слушаем сокет
					listenSocket(socket);
				}
			} while (typeof(socket) === 'undefined');
			//проверяем задания каждые 15 сек
			setInterval(function(){
				try {
					var data_val = clientStorage.getState().tasks;
					if(typeof(data_val) === 'object'){
						for(var key_val in data_val){
							try {
								if(typeof(data_val[key_val].timeoncompl) === 'undefined'){
									data_val[key_val].timeoncompl = 0;
								}
								if((data_val[key_val].complete !== 'true') && (typeof(clientStorage.getState().executetask[key_val]) === 'undefined') && (clientStorage.getState().complete.indexOf(key_val) === -1) &&  (data_val[key_val].timeoncompl < Date.now())){
									console.log(colors.yellow(datetime() + "Найдено новое актуальное задание: " + key_val));
									try {
										var flag = true;
										if(Array.isArray(data_val[key_val].dependencies)){
											for(var i = 0; i < data_val[key_val].dependencies.length; i++ ){
												if(clientStorage.getState().complete.indexOf(data_val[key_val].dependencies[i]) === -1){
													flag = false;
													console.log(colors.yellow(datetime() + "Для задачи " + key_val + " обнаружена невыполненная зависимость: " + data_val[key_val].dependencies[i] + ". Задание будет выполнено в следующий раз."));
												}
											}
										}
										if(flag){ 
											runTask(socket, key_val, data_val);
										}
									} catch (e) {
										console.log(colors.red(datetime() + "Не могу обработать зависимости задания: " + e));
									}
								}
							} catch(e){
								console.log(colors.red(datetime() + "Ошибка выполнения задания: " + e));
							}
						}
					} else {
						console.log(colors.red(datetime() + "Хранилище заданий не является объектом!"));
					}
				} catch(e){
					console.log(colors.red(datetime() + "Не могу получить список заданий из хранилища!"));
				}
			}, 15000);
			//запускаю сборщик мусора каждый час
			setInterval(GarbageCollector, 3600000);
		});
	}
}, function(error){
	console.log(colors.red(datetime() + "Ошибка инициализации!"));
});



/* ### Хранилище состояний ### */
var clientStorage = redux.createStore(editStore);
function editStore(state = {tasks: {}, complete: [], incomplete:[], executetask:{}}, action){
	try {
		switch (action.type){
			case 'ADD_TASK':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid] = action.payload.task;
				return state_new;
				break;
			case 'TASK_COMPLETE':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
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
				delete state_new.executetask[action.payload.uid];
				return state_new;
				break;
			case 'TASK_INCOMPLETE':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				if(clientStorage.getState().incomplete.indexOf(action.payload.uid) === -1){
					state_new.incomplete.push(action.payload.uid);
				}
				if(clientStorage.getState().complete.indexOf(action.payload.uid) !== -1){
					state_new.complete.splice(clientStorage.getState().complete.indexOf(action.payload.uid),1);
				}
				return state_new;
				break;
			case 'TASK_ERROR':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].tryval = state.tasks[action.payload.uid].tryval + 1;
				delete state_new.executetask[action.payload.uid];
				return state_new;
				break;
			case 'TASK_START':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				state_new.executetask[action.payload.uid] = Date.now();
				return state_new;
				break;
			case 'DB_SYNC':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = action.payload;
				state_new.executetask = [];
				return state_new;
				break;
			case 'DB_CLEAR_TASK':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				delete state_new.tasks[action.payload.uid];
				console.log(colors.yellow(datetime() + "Удаляю задание с истекшим сроком: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_COMPL':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				var taskid = state.complete.indexOf(action.payload.uid);
				state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.complete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива complete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_INCOMPL':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				var taskid = state.incomplete.indexOf(action.payload.uid);
				state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.incomplete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива incomplete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_REPLANSW_TASK':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].answer = state.tasks[action.payload.uid].answer.substring(0,500) + '...';
				return state_new;
				break;
			case 'DB_CLEAR_EXECUTETASK':
				var state_new = {tasks: {}, complete: [], incomplete:[], executetask:{}};
				state_new = lodash.clone(state);
				delete state_new.executetask[action.payload.uid];
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
					if(error) throw error; 
					resolve(JSON.parse(data));
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
			socket.emit('login', { user: user_val, password: password_val });
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
function listenSocket(socket){
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
							filename: fileName
						};
						download(extPath, options, function(err){
							try{
								if (err) throw err;
								taskOnComplete(socket, uid_val);
								console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
								resolve("ok");
							} catch(e) {
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve("error");
							}
						});
						break;
					case 'linux':
						var options = {
							directory: intPath.replace(/\\/gi, '/'),
							filename: fileName
						};
						download(extPath, options, function(err){
							try{
								if (err) throw err;
								taskOnComplete(socket, uid_val);
								console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
								resolve("ok");
							} catch(e) {
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve("error");
							}
						});
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve("error");
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve("ok");
			}
		} catch (e) {
			console.log(colors.red(datetime() + "Не могу скачать файл в директорию, по причине:" + e));
			resolve("error");
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
						var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
							if (error) {
								throw error;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
								resolve("error");
								return;
							}
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
							resolve("ok");
						});
						break;
					case 'linux':
						var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
							if (error) {
								throw error;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
								resolve("error");
								return;
							}
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
							resolve("ok");
						}); 
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve("error");
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve("ok");
			}
		} catch (e){
			console.log(colors.red(datetime() + "Не могу запустить файл, по причине:" + e));
			resolve("error");
		}
	});
}

//функция запуска shell-команды
function execProcess(socket, uid_val, execCommand, platform){
	return new Promise(function(resolve){
		try{
			if(platform === os.platform()){
				var child = child_process.exec(execCommand, (error, stdout, stderr) => {
					if (error) {
						if(clientStorage.getState().tasks[uid_val].tryval < 100){
							clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
						} else {
							taskOnComplete(socket, uid_val, error);
						}
						console.log(colors.red(datetime() + "Ошибка выполнения команды " + execCommand + ":" + error));
						resolve("error");
						return;
					}
					if((typeof(stderr) !== 'undefined') && (stderr !== '')){
						if((typeof(stdout) !== 'undefined') && (stdout !== '')){
							returnAnswer = 'Результат: ' + stdout + ' \n ' + 'Ошибок: ' + stderr;
						} else {
							returnAnswer = 'Ошибока: ' + stderr;
						}					
					} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
						returnAnswer = 'Результат: ' + stdout;
					} else {
						returnAnswer = '';
					}
					taskOnComplete(socket, uid_val, returnAnswer);
					resolve("ok");
				});
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve("ok");
			}
		} catch (e){
			if(clientStorage.getState().tasks[uid_val].tryval < 100){
				clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
			} else {
				taskOnComplete(socket, uid_val, e);
			}
			console.log(colors.red(datetime() + "Не могу выполнить команду, по причине:" + e));
			resolve("error");
		}
	});
}

//функция изменения состояния при выполнении таска
function taskOnComplete(socket, uid_val, answer_val){
	var realAnswer = 'none';
	try {
		if((typeof(answer_val) !== 'string') && (typeof(answer_val) !== 'undefined') && (answer_val !== '')){
			realAnswer = answer_val.toString();
		} else if (typeof(answer_val) === 'string'){
			realAnswer = answer_val;
		}
		if(realAnswer.length > 503){
			realAnswer = realAnswer.substring(0,500) + '...';
		}
		//realAnswer = realAnswer.replace(/([^>])\n+/g, '<br \\>');
	} catch (e){}
	try {
		clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:uid_val, answer:realAnswer}});
		console.log(colors.green(datetime() + "Задание " + uid_val + " выполнено!"));
	} catch (e){
		console.log(colors.red(datetime() + "Не могу изменить состояние таска, по причине:" + e));
	}
	try {
		if(typeof(clientStorage.getState().tasks[uid_val].tryval) !== 'undefined'){
			var TryVal = clientStorage.getState().tasks[uid_val].tryval;
		} else {
			var TryVal = 0;
		}
		socket.emit('completetask', { uid: uid_val, answer:realAnswer, tryval: TryVal});
	} catch (e){
		console.log(colors.red(datetime() + "Не могу отправить отчет о задании в сокет, по причине:" + e));		
	}
}

//функция запуска выполнения заданий
function runTask(socket, key, data){
	try {
		if((data[key].complete !== 'true') && (typeof(clientStorage.getState().executetask[key]) === 'undefined') && (clientStorage.getState().complete.indexOf(key) === -1) && (data[key].timeoncompl < Date.now())) {
			clientStorage.dispatch({type:'TASK_START', payload: {uid:key}});
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
					return new Promise(function(resolve){resolve("error");});
					break;
			}
		}
	} catch (e) {
		console.log(colors.red(datetime() + "Не могу выполнить задание, по причине:" + e));
		return new Promise(function(resolve){resolve("error");});
	}
}

//функция очистки хранилища
function GarbageCollector(){
	var lifetime = 86400000 * 10; //устанавливаю срок хранения локальных данных в 10 дней
	var actualStorage = clientStorage.getState();
	try{
		try{
			for(var keyTask in actualStorage.tasks){
				try{
					if((actualStorage.tasks[keyTask].datetime + lifetime) < Date.now()){
						clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
					}
				} catch(e){
					console.log(colors.red(datetime() + "Сборщиком мусора не обработана задача с uid: "  + keyTask));
				}
				try{
					if(actualStorage.tasks[keyTask].answer.length > 503){
						clientStorage.dispatch({type:'DB_REPLANSW_TASK', payload: {uid:keyTask}});
						console.log(colors.yellow(datetime() + "Найден слишком длинный ответ в задании " + keyTask + ", обрезаю!"));
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка обрезки ответа для задания " + keyTask + " сборщиком мусора!"));
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
			var lifeexec = 43200000; //срок выполнения задания (ставлю 12 часов)
			for(var keyTask in actualStorage.executetask){
				try{
					if(typeof(actualStorage.tasks[keyTask]) === 'undefined'){
						clientStorage.dispatch({type:'DB_CLEAR_EXECUTETASK', payload: {uid:keyTask}});
					} else if (actualStorage.tasks[keyTask].complete === 'true') {
						clientStorage.dispatch({type:'DB_CLEAR_EXECUTETASK', payload: {uid:keyTask}});
					} else if ((actualStorage.executetask + lifeexec) < Date.now()){
						clientStorage.dispatch({type:'DB_CLEAR_EXECUTETASK', payload: {uid:keyTask}});
					}
				} catch(e){
					console.log(colors.red(datetime() + "Сборщиком мусора в массиве executetask не обработан id: "  + keyTask));
				}
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка прохода сборщиком мусора по массиву executetask: "  + e));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Неустранимая ошибка в работе сборщика мусора: "  + e));
	}
}