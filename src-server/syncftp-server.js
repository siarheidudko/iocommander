/* ### Раздел переменных ### */

const http=require("http"), 
colors=require("colors"),
fs=require("fs"),
cryptojs=require("cryptojs"),
redux=require("redux"),
lodash=require("lodash"),
firebase=require("firebase");

var port, firebase_user, firebase_pass, config;



/* ### Хранилища состояний REDUX ### */

function editServerStore(state = {users:{}, admins:{}, tasks: {}}, action){
	if(action.type === 'ADD_USER'){
		var state_new = {};
		state_new = lodash.clone(state);
		state_new.users[action.payload.user] = action.payload.password;
		return state_new;
	}
	if(action.type === 'ADD_ADMIN'){
		var state_new = {};
		state_new = lodash.clone(state);
		state_new.admins[action.payload.user] = action.payload.password;
		return state_new;
	}
	if(action.type === 'ADD_TASK'){
		var state_new = {};
		state_new = lodash.clone(state);
		if(typeof(state_new.tasks[action.payload.user]) === 'undefined'){
			state_new.tasks[action.payload.user] = {};
		}
		state_new.tasks[action.payload.user][action.payload.task.uid] = action.payload.task.task;
		return state_new;
	}
	if(action.type === 'COMPLETE_TASK'){
		var state_new = {};
		state_new = lodash.clone(state);
		state_new.tasks[action.payload.user][action.payload.task].complete = 'true';
		return state_new;
	}
	if(action.type === 'SYNC'){
		var state_new = action.payload;
		return state_new;
	}
	return state;
}
var serverStorage = redux.createStore(editServerStore);

serverStorage.subscribe(function(){
	AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
		if(value === 'auth'){
			SendData(serverStorage.getState());
		}
	})
});

function editConnectionStore(state = {uids:{}}, action){
	if(action.type === 'ADD_UID'){
		var state_new = {};
		state_new = lodash.clone(state);
		state_new.uids[action.payload.uid] = action.payload.user;
		return state_new;
	}
	return state;
}

var connectionStorage = redux.createStore(editConnectionStore); 



/* ### Раздел функций ### */

//функция чтения файла конфигурации
function getSettings(){
	return new Promise(function (resolve){
		try {
			fs.readFile(".\\src-server\\syncftp-server.conf", "utf8", function(error,data){
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
function testUser(user_val, password_val){
	var renameuser = replacer(user_val, true);
	if(typeof(serverStorage.getState().users) !== 'undefined'){
		if (serverStorage.getState().users[renameuser] === password_val) {
			return true;
		} else {
			return false;
		}
	} else {
		console.log(serverStorage.getState().users);
		return false;
	}
}

//функция проверки имени пользователя и пароля администратора
function testAdmin(user_val, password_val){
	var renameuser = replacer(user_val, true);
	if(typeof(serverStorage.getState().admins) !== 'undefined'){
		if (serverStorage.getState().admins[renameuser] === password_val) {
			return true;
		} else {
			return false;
		}
	} else {
		console.log(serverStorage.getState().users);
		return false;
	}
}

//функция записи в массив пользователей
function setUser(user_val, param_val, value_val){
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
}

//функция записи в массив администраторов
function setUAdmin(user_val, param_val, value_val){
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
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
}

//функция замены "." на "_" и обратно
function replacer(data_val, value_val){
	if(typeof(data_val === 'string')){
		if(value_val){
			return data_val.replace(/\./gi,"_");
		} else {
			return data_val.replace(/\_/gi,".");
		}
	} else {
		return '(не могу преобразовать)';
	}
}

//функция добавления задачи
function setTask(user_val, value_val){
	var renameuser = replacer(user_val, true);
	serverStorage.dispatch({type:'ADD_TASK', payload: {user:renameuser, task:value_val}});
}

//функция генерации UID
function generateUID() { 
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); 
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
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
		console.log(colors.red(datetime() + "Проблема с авторизацией в firebase: " + error));
	});
};

//функция получения данных из firebase
function GetFirebaseData(){
	return new Promise(function (resolve){
		firebase.database().ref('/').once('value', function(snapshot) {
			resolve(JSON.stringify(snapshot.val()));
		});
	}, function(error){
		console.log(colors.red(datetime() + "Проблема получения данных из firebase: " + error));
	});
}

//функция записи данных в firebase
function SendData(DataBody){
	var tokendata = new Date();
	tokendatastr = tokendata.toString();
	firebase.database().ref('/').set(DataBody).then(function(value){
		console.log(colors.green(datetime() + "Синхронизация с firebase успешна!"));
	}).catch(function(error){
		console.log(colors.red(datetime() + "Ошибка записи данных: " + error.message));
	});
}



/* ### Раздел работы с SOCKET.IO ### */
getSettings().then(function(value){
	//загружаем файл конфигурации
	port = parseInt(value.port, 10);
	firebase_user = value.firebase_user;
	firebase_pass = value.firebase_pass;
	config = value.firebase_config;
	
	firebase.initializeApp(config);
	
	//грузим данные из firebase в redux при старте, если они не null
	var Initialize = new Promise(function(resolve){
		AuthUserFirebase(firebase_user, firebase_pass).then(function(value){
			if(value === 'auth'){
				GetFirebaseData().then(function(value_child){
					if(value_child !== null){
						var value_child_obj = JSON.parse(value_child);
						if((typeof(value_child_obj.users) !== 'undefined') && (typeof(value_child_obj.tasks) !== 'undefined')){
							serverStorage.dispatch({type:'SYNC', payload: value_child_obj});
						}
					}
					resolve('okay');
				});
			}
		})
	}, function(error){
		console.log(colors.red(datetime() + "Проблема с загрузкой данных из firebase: " + error));
	});


	Initialize.then(function(value){
		if(value === 'okay'){
			
			/////////////////////////////////////
		//	setUser('fitobel.apt01', 'password', cryptojs.Crypto.MD5('12345678'));
		//	var task1 = {uid:generateUID(), task: {nameTask:'getFileFromWWW', extLink:'http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm', intLink:'/test/', fileName: '1.rpm', exec:'false', complete:'false'}};
		//	var task2 = {uid:generateUID(), task: {nameTask:'execFile', intLink:'', fileName: 'node', paramArray:['--version'], complete:'false'}};
		//	var task3 = {uid:generateUID(), task: {nameTask:'execCommand', execCommand:'echo "111"', platform:'win32', complete:'false'}};
			//setTask('fitobel.apt01', task1);
			//setTask('fitobel.apt01', task2);
		//	setTask('fitobel.apt03', task3);
		//	setTask('fitobel.apt01', task3);
			///////////////////////////////////////////////
			
			server=http.createServer().listen(port, function() {
				console.log(colors.gray(datetime() + 'listening on *:' + port));
				}); 
				
			io=require("socket.io").listen(server, { log: true ,pingTimeout: 3600000, pingInterval: 25000});
			io.sockets.on('connection', function (socket) {
				io.sockets.sockets[socket.id].emit('initialize', { value: 'whois' });
				io.sockets.sockets[socket.id].on('login', function (data) { 
					if(testUser(data.user, data.password)) {
						io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
						setUser(data.user, 'uid', socket.id);
						console.log(colors.green(datetime() + "Подключение пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
						io.sockets.sockets[socket.id].emit('sendtask', serverStorage.getState().tasks[replacer(data.user, true)]);
						io.sockets.sockets[socket.id].on('completetask', function (data) {
							serverStorage.dispatch({type:'COMPLETE_TASK', payload: {user:connectionStorage.getState().uids[socket.id], task:data.uid}});
						});
					} else if(testAdmin(data.user, data.password)) {
						io.sockets.sockets[socket.id].emit('authorisation', { value: 'true' });
						setUser(data.user, 'uid', socket.id);
						console.log(colors.green(datetime() + "Подключение администратора\nLogin: " + data.user + "\nUID: " + socket.id));;
					} else {
						socket.emit('authorisation', { value: 'false' });
						console.log(colors.red(datetime() + "Неверный пароль для пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
					}
				});
			  
				socket.on('disconnect', function () {
					console.log(colors.red(datetime() + "Отключение пользователя\nLogin: " + replacer(connectionStorage.getState().uids[socket.id], false) + "\nUID: " + socket.id));
				});
			  
			});
		}
	}); 
});