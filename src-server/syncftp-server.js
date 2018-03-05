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

function editServerStore(state = {users:{}, admins:{}, tasks: {}}, action){
	try{
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
			state_new.tasks[action.payload.user][action.payload.task].answer = action.payload.answer;
			return state_new;
		}
		if(action.type === 'SYNC'){
			var state_new = action.payload;
			return state_new;
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

function editConnectionStore(state = {uids:{}}, action){
	try {
		if(action.type === 'ADD_UID'){
			var state_new = {};
			state_new = lodash.clone(state);
			state_new.uids[action.payload.uid] = action.payload.user;
			return state_new;
		}
		if(action.type === 'REMOVE_UID'){
			var state_new = {};
			state_new = lodash.clone(state);
			delete state_new.uids[action.payload.uid];
			return state_new;
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
	try{
		var renameuser = replacer(user_val, true);
		if(typeof(serverStorage.getState().users) !== 'undefined'){
			if (serverStorage.getState().users[renameuser] === password_val) {
				return true;
			} else {
				return false;
			}
		} else {
			console.log(colors.red(datetime() + "Объект пользователи основного хранилища не существует!"));
			return false;
		}
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка проверки имени пользователя и пароля пользователя!"));
	}
}

//функция проверки имени пользователя и пароля администратора
function testAdmin(user_val, password_val){
	try{
		var renameuser = replacer(user_val, true);
		if(typeof(serverStorage.getState().admins) !== 'undefined'){
			if (serverStorage.getState().admins[renameuser] === password_val) {
				return true;
			} else {
				return false;
			}
		} else {
			console.log(colors.red(datetime() + "Объект администраторы основного хранилища не существует!"));
			return false;
		}
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка проверки имени пользователя и пароля администратора!"));
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



/* ### Раздел работы с сокетом ### */
try {
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
				
				/////////////////////////////////////
				setUser('fitobel.apt01', 'password', cryptojs.Crypto.MD5('12345678'));
				setAdmin('serg.dudko', 'password', cryptojs.Crypto.MD5('12345'));
			//	var task1 = {uid:generateUID(), task: {nameTask:'getFileFromWWW', extLink:'http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm', intLink:'/test/', fileName: '1.rpm', exec:'false', complete:'false', answer:''}};
				var task2 = {uid:generateUID(), task: {nameTask:'execFile', intLink:'', fileName: 'node', paramArray:['--version'], complete:'false', answer:''}};
				var task3 = {uid:generateUID(), task: {nameTask:'execCommand', execCommand:'echo "111"', platform:'win32'}};
			//	setTask('fitobel.apt01', task1);
				setTask('fitobel.apt01', task2);
				setTask('fitobel.apt03', task3);
				setTask('fitobel.apt01', task3);
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
								serverStorage.dispatch({type:'COMPLETE_TASK', payload: {user:connectionStorage.getState().uids[socket.id], task:data.uid, answer:data.answer}});
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
						connectionStorage.dispatch({type:'REMOVE_UID', payload: {uid:socket.id}});
						console.log(colors.red(datetime() + "Отключение пользователя\nLogin: " + replacer(connectionStorage.getState().uids[socket.id], false) + "\nUID: " + socket.id));
					});
				  
				});
			}
		}, function(error){
			console.log(colors.red(datetime() + "Неизвестная критическая ошибка работы сервера: " + error));
		}); 
	}, function(error){
		console.log(colors.red(datetime() + "Инициализация сервера не выполнена по причине: " + error));
	});
} catch (e){
	console.log(colors.red(datetime() + "Не могу загрузить конфигурацию сервера!"));
}