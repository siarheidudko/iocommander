/* ### Раздел инициализации ### */
const InitString = '{"protocol":"http","server":"localhost","port":"444","login":"serg.dudko","password":"12345"}';

var user_val, password_val, JsonInitString;

try {			
	JsonInitString = (JSON.parse(InitString));
} catch (e) {
	console.log(datetime() + "Не могу распарсить строку конфигурации!");
}

if(typeof(JsonInitString) === 'object'){
	user_val = JsonInitString.login; 
	password_val = MD5(JsonInitString.password);
	if(typeof(socket) !== 'undefined'){
		socket.close();
	}
	var protocol_val = JsonInitString.protocol,
	server_val = JsonInitString.server,	
	port_val = JsonInitString.port,
	socket = io(protocol_val + '://' + server_val + ':' + port_val);
	do {
		if (typeof(socket) !== 'undefined'){
			socket.on('connect', () => {
				console.log(datetime() + "Соединение установлено!");
			});
			socket.on('initialize', function (data) {
				if(data.value === 'whois'){
					login(socket);
				}
			});
			socket.on('authorisation', function (data) {
				if(data.value === 'true'){
					console.log(datetime() + "Авторизация пройдена!");
				} else {
					//если авторизация неудачна, пробую каждые 5 минут
					console.log(datetime() + "Авторизация не пройдена!");
					setTimeout(login, 300000);
				}
			});
			listenSocket(socket);
		}
	} while (typeof(socket) === 'undefined');
} else {
	console.log(datetime() + "Не могу распознать объект конфигурации!");
}



/* ### Хранилища состояний ### */
var serverStorage = {};
var connectionStorage = {};



/* ### Раздел функций ### */
//функция авторизации в сокете
function login(socket) {
	if(typeof(socket) === 'object'){
		socket.emit('login', { user: user_val, password: password_val });
	}
}

//функция для таймштампа
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
}

//функция работы с сокетом
function listenSocket(socket){
	socket.on('sendServerStorageToAdmin', function (data) {
		serverStorage = data;
	});
	socket.on('sendConnStorageToAdmin', function (data) {
		connectionStorage = data;
	});
	socket.on('disconnect', () => {
		console.log(datetime() + "Соединение разорвано!");
	});
}