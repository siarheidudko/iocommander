/* ### Раздел инициализации ### */

var fs=require("fs"),
colors=require("colors"),
cryptojs=require("cryptojs"),
download = require('download-file'),
user_val = '', 
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
		for(i=0;i<data.length;i++){
			switch (data[i].nameTask){
				case "getFileFromWWW":
					writeFile(data[i].extLink, data[i].intLink, data[i].fileName);
					break;
				default:
					console.log(data[i]);
					break;
			}
		}
	});
	socket.on('disconnect', () => {
		console.log(colors.red(datetime() + "Соединение разорвано!"));
	});
}

//функция записи в файловую систему
function writeFile(extPath, intPath, fileName){
	var options = {
		directory: intPath.replace(/\\/gi, '/'),
		filename: fileName
	};
	download(extPath, options, function(err){
		if (err) throw err
		console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
	});
}