/* ### Раздел переменных ### */

var socket = require('socket.io-client').connect('http://localhost'),
fs=require("fs"),
colors=require("colors"),
cryptojs=require("cryptojs");

var user_val = 'fitobel.apt01';
var password_val = cryptojs.Crypto.MD5('12345678');



/* ### Раздел функций ### */

//функция авторизации в сокете
function login() {
	socket.emit('login', { user: user_val, password: password_val });
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
}




/* ### Раздел работы с сокетом ### */

socket.on('initialize', function (data) {
	if(data.value === 'whois'){
		login();
	}
});

socket.on('auth', function (data) {
	if(data.value === 'true'){
		console.log(colors.green(datetime() + "Авторизация пройдена!"));
		socket.on('sendfile', function (data) {
			console.log(colors.green(datetime() + "Получаю файл!"));
		});
	} else {
		//если авторизация неудачна, пробую каждые 5 минут
		console.log(colors.red(datetime() + "Авторизация не пройдена!"));
		setTimeout(login, 300000);
	}
});