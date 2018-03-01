/* ### Раздел переменных ### */

var http=require("http"), 
colors=require("colors"),
fs=require("fs"),
cryptojs=require("cryptojs"),
port = 80;

/* ### Хранилища состояний ### */

var users = {},
uids = {}
tasks = {};

/////////////////////////////////////
setUser('fitobel.apt01', 'password', cryptojs.Crypto.MD5('12345678'));
var task = {nameTask:"getFileFromWWW", extLink:"http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm", intLink:"c:\\test\\", fileName: "1.rpm", exec:"false"};
setTask('fitobel.apt01', task);
///////////////////////////////////////////////

/* ### Раздел функций ### */

//функция проверки имени пользователя и пароля
function testUser(user_val, password_val){
	var renameuser = replacer(user_val, true);
	if (users[renameuser].password === password_val) {
		return true;
	} else {
		return false;
	}
}

//функция записи в массив пользователей
function setUser(user_val, param_val, value_val){
	var renameuser = replacer(user_val, true);
	if(typeof(users[renameuser]) === 'undefined'){
		users[renameuser] = {};
	}
	switch (param_val){
		case 'password':
			users[renameuser].password = value_val;
			console.log(colors.green(datetime() + "Регистрация пользователя\nLogin: " + user_val));
			break;
		case 'uid':
			users[renameuser].uid = value_val;
			if(typeof(uids[value_val]) === 'undefined'){
				uids[value_val] = {};
			}
			uids[value_val].user = replacer(user_val, true);
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
	if(value_val){
		return data_val.replace(/./gi,"_");
	} else {
		return data_val.replace(/_/gi,".");
	}
}

//функция добавления задачи
function setTask(user_val, value_val){
	var renameuser = replacer(user_val, true);
	if(typeof(tasks[renameuser]) === 'undefined'){
		tasks[renameuser] = [];
	}
	tasks[renameuser].push(value_val);
}



/* ### Раздел работы с сокетом ### */
	
server=http.createServer().listen(port, function() {
	console.log(colors.gray(datetime() + 'listening on *:' + port));
	}); 
	
io=require("socket.io").listen(server, { log: true ,pingTimeout: 3600000, pingInterval: 25000});

io.sockets.on('connection', function (socket) {
	socket.emit('initialize', { value: 'whois' });
  
	socket.on('login', function (data) {
		if(testUser(data.user, data.password)) {
			socket.emit('authorisation', { value: 'true' });
			setUser(data.user, 'uid', socket.id);
			console.log(colors.green(datetime() + "Подключение пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
			socket.emit('sendtask', tasks[replacer(data.user, true)]);
		} else {
			socket.emit('authorisation', { value: 'false' });
			console.log(colors.red(datetime() + "Неверный пароль для пользователя\nLogin: " + data.user + "\nUID: " + socket.id));
		}
	});
  
	socket.on('disconnect', function () {
		console.log(colors.red(datetime() + "Отключение пользователя\nLogin: " + replacer(uids[socket.id].user, false) + "\nUID: " + socket.id));
	});
  
});