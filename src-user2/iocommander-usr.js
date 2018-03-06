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

getSettings().then(function(value){
	if(value !== 'error'){
		user_val = value.login; 
		password_val = cryptojs.Crypto.SHA256(user_val+value.password+'icommander');
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
}, function(error){
	console.log(colors.red(datetime() + "Ошибка инициализации!"));
});



/* ### Хранилище состояний ### */
var clientStorage = redux.createStore(editStore);
function editStore(state = {tasks: {}, complete: [], incomplete:[]}, action){
	try {
		if(action.type === 'ADD_TASK'){
			var state_new = {tasks: {}, complete: [], incomplete:[]};
			state_new = lodash.clone(state);
			state_new.tasks[action.payload.uid] = action.payload.task;
			return state_new;
		}
		if(action.type === 'TASK_COMPLETE'){
			var state_new = {tasks: {}, complete: [], incomplete:[]};
			state_new = lodash.clone(state);
			if((typeof(action.payload.answer) !== 'undefined') && (action.payload.answer !== '')){
				state_new.tasks[action.payload.uid].answer = action.payload.answer;
			}
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
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка при обновлении хранилища:" + e));
	}
	return state;
}

clientStorage.subscribe(function(){
	//console.log(clientStorage.getState());
});



/* ### Раздел функций ### */
//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		try {
			fs.readFile(".\\src-user2\\iocommander-usr.conf", "utf8", function(error,data){
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
							clientStorage.dispatch({type:'ADD_TASK', payload: {uid:key, task:data[key]}});
							if(data[key].complete === 'true'){
								clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:key}});
							} else {
								clientStorage.dispatch({type:'TASK_INCOMPLETE', payload: {uid:key}});
							}
						} catch (e) {
							console.log(colors.red(datetime() + "Не могу добавить задачу в хранилище!"));
						}
						runTask(socket, key, data);
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
function writeFile(socket, uid_val, extPath, intPath, fileName){
	try {
		switch (os.platform()) {
			case "win32":
				intPath = 'c:' + intPath;
				var options = {
					directory: intPath.replace(/\\/gi, '/'),
					filename: fileName
				};
				download(extPath, options, function(err){
					if (err) throw err
					taskOnComplete(socket, uid_val);
					console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
				});
				break;
			case 'linux':
				var options = {
					directory: intPath.replace(/\\/gi, '/'),
					filename: fileName
				};
				download(extPath, options, function(err){
					if (err) throw err
					taskOnComplete(socket, uid_val);
					console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
				});
				break;
			default:
				console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
				break;
		}
	} catch (e) {
		console.log(colors.red(datetime() + "Не могу скачать файл в директорию, по причине:" + e));
	}
}

//функция запуска исполняемого файла, работаем только с корнем (для win32 диском C)
function execFile(socket, uid_val, intPath, fileName, paramArray){
	try {
		switch (os.platform()) {
			case "win32":
				if (intPath !== ""){
					intPath = 'c:' + intPath;
				}
				var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
					if (error) {
						throw error;
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
					console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
				});
				break;
			case 'linux':
				var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
					if (error) {
						throw error;
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
					console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
				}); 
				break;
			default:
				console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
				break;
		}
	} catch (e){
		console.log(colors.red(datetime() + "Не могу запустить файл, по причине:" + e));
	}
}

//функция запуска shell-команды
function execProcess(socket, uid_val, execCommand, platform){
	try{
		if(platform === os.platform()){
			var child = child_process.exec(execCommand, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
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
			});
		} else {
			console.log(colors.green(datetime() + "Команда для другой платформы!"));
		}
	} catch (e){
		console.log(colors.red(datetime() + "Не могу выполнить команду, по причине:" + e));
	}
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
	} catch (e){}
	try {
		clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:uid_val, answer:realAnswer}});
	} catch (e){
		console.log(colors.red(datetime() + "Не могу изменить состояние таска, по причине:" + e));
	}
	try {
		socket.emit('completetask', { uid: uid_val, answer:realAnswer});
	} catch (e){
		console.log(colors.red(datetime() + "Не могу отправить отчет о задании в сокет, по причине:" + e));
	}
}

//функция запуска выполнения заданий
function runTask(socket, key, data){
	try {
		if((data[key].complete !== 'true') && (clientStorage.getState().complete.indexOf(key) === -1)) {
			switch (data[key].nameTask){
				case "getFileFromWWW":
					writeFile(socket, key, data[key].extLink, data[key].intLink, data[key].fileName);
					break;
				case "execFile":
					execFile(socket, key, data[key].intLink, data[key].fileName, data[key].paramArray);
					break;
				case "execCommand":
					execProcess(socket, key, data[key].execCommand, data[key].platform);
					break;
				default:
					break;
			}
		}
	} catch (e) {
		console.log(colors.red(datetime() + "Не могу выполнить задание, по причине:" + e));
	}
}