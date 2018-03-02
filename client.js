/* ### Раздел инициализации ### */

const fs=require("fs"),
colors=require("colors"),
cryptojs=require("cryptojs"),
download = require("download-file")
os = require("os"),
child_process = require("child_process"),
redux=require("redux"),
lodash=require("lodash");
var user_val = '', 
password_val = '';

getSettings().then(function(value){ 
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
					listenSocket(socket);
				} else {
					//если авторизация неудачна, пробую каждые 5 минут
					console.log(colors.red(datetime() + "Авторизация не пройдена!"));
					setTimeout(login, 300000);
				}
			});
		}
	} while (typeof(socket) === 'undefined');
});



/* ### Хранилище состояний REDUX ### */

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
	console.log(clientStorage.getState());
});



/* ### Раздел функций ### */

//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		fs.readFile("syncftp.conf", "utf8", function(error,data){
			if(error) throw error; 
			try {
				resolve(JSON.parse(data));
			} catch(e){
				console.log(colors.red(datetime() + "Конфигурационный файл испорчен!"));
				resolve('error');
			}
		});
	});
}

//функция авторизации в сокете
function login(socket) {
	socket.emit('login', { user: user_val, password: password_val });
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
}

//функция работы с сокетом
function listenSocket(socket){
	socket.on('sendtask', function (data) {
		console.log(colors.green(datetime() + "Получаю задания!"));
		for(var key in data){
			clientStorage.dispatch({type:'ADD_TASK', payload: {uid:key, task:data[key]}});
			if(data[key].complete === 'true'){
				clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:key}});
			} else {
				clientStorage.dispatch({type:'TASK_INCOMPLETE', payload: {uid:key}});
			}
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
						console.log(data[key]);
						break;
				}
			}
		}
	});
	socket.on('disconnect', () => {
		console.log(colors.red(datetime() + "Соединение разорвано!"));
	});
}

//функция записи в файловую систему, работаем только с корнем (для win32 диском C)
function writeFile(socket, uid_val, extPath, intPath, fileName){
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
}

//функция запуска исполняемого файла, работаем только с корнем (для win32 диском C)
function execFile(socket, uid_val, intPath, fileName, paramArray){
	switch (os.platform()) {
		case "win32":
			if (intPath !== ""){
				intPath = 'c:' + intPath;
			}
			var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
				if (error) {
					throw error;
				}
				taskOnComplete(socket, uid_val);
				console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
				console.log(stdout);
			});
			break;
		case 'linux':
			var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
				if (error) {
					throw error;
				}
				taskOnComplete(socket, uid_val);
				console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
				console.log(stdout);
			}); 
			break;
		default:
			console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
			break;
	}
}

//функция запуска shell-команды
function execProcess(socket, uid_val, execCommand, platform){
	if(platform === os.platform()){
		var child = child_process.exec(execCommand, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			taskOnComplete(socket, uid_val);
			console.log(`stdout: ${stdout}`);
			console.log(`stderr: ${stderr}`);
		});
	} else {
		console.log(colors.green(datetime() + "Команда для другой платформы!"));
	}
}

//функция изменения состояния при выполнении таска
function taskOnComplete(socket, uid_val){
	clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:uid_val}});
	socket.emit('completetask', { uid: uid_val });
}