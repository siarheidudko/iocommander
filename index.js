/*var fs = require('fs');
	var io = require('socket.io')(3000,{  
	key: fs.readFileSync('ssl/assistant.farmin.by.key'),  
	cert: fs.readFileSync('ssl/assistant.farmin.by.crt')
	});*/
function datetime() {
	var dt = new Date();
	return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	}
var users = [];
var sockets = [];
var iduser = {};
var https=require("https"), 
colors=require("colors");
fs=require("fs"), 
server=https.createServer( 
	{ 
		key:fs.readFileSync("/etc/nginx/ssl/privkey.pem"), 
		cert:fs.readFileSync("/etc/nginx/ssl/fullchain.pem")
	}
)
.listen(16387, function() {
	console.log(datetime() + 'listening on *:16387');
	}); 
io=require("socket.io").listen(server, { log: true ,pingTimeout: 3600000, pingInterval: 25000});
/*Проверяем каждые 10 минут доступность пользователей*/
setInterval(function(){
//Перебираем массив пользователей
	for(var i = 0; i < users.length; i++){
//Если переменная существует
		if(users[i]!==undefined) {
//Парсим по разделителю ;
			user_arr = users[i].split(';');
			try {
//Отправляем сообщение об успешном подключении в случае, если до этого соединение было утеряно (проверка на уровне клиента)
				io.sockets.connected[user_arr[3]].emit('connect');
//+				console.log(colors.magenta(datetime() + 'Пользователь ' + user_arr[0] + ' доступен'));
				} catch (e) {
//При ошибке очищаем переменные от данного пользователя
//+					console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+					console.log(colors.yellow(datetime() + "Пользователь не доступен!\nLogin: " + userdate[0] + "\nID: " + user_arr[3]));
				delete iduser[user_arr[3]];
				var user_answer = '';
//Перебираем вновь массив отвеченных пользователей и отправляем его в соккет администраторам для обновления текущего списка пользователей
				for(var i in users) 
					user_answer += users[i] + '&';
//Отправляем новые данные по пользвоателям в соккет
				io.emit('users_answer',user_answer);
				}
			}
		}
//Повторяем каждые 10 минут
	},600000);
io.sockets.on('connection', function(socket){//Подключение
//при новом подключении заводим переменную с ключем и значением id сессии пользователя
	iduser[socket.id] = socket.id;
//Принимаем запросы user - отправляются браузером при первоначальном подключении к assistant на странице index.php
	socket.on('users', function(user){
//Переменная user должна быть вида login;cn;vnum;id-session. Дажее ее парсим для последующей записи и корректного отображения в логе
		userdate = user.split(';');
//Для пустого массива заводим с ключем 0
		if(users.length==0) {
			users[0] = user + ';' + socket.id;
//+				console.log(colors.green(datetime() + "Подключение первого пользователя\nLogin: " + userdate[0] + "\nИмя: " + userdate[1] + "\nID: " + socket.id));
			} else {
//При повторной авторизации логина пользователя, обновляем данные путем удаление и последующей записи с новым id сессии
			for(k in users) {
				if(users[k].indexOf(userdate[0]) + 1)
					delete users[k];
				}
//В переменную с пользователями записываем новые данные
			users[users.length] = user + ';' + socket.id;
//+				console.log(colors.green(datetime() + "Подключение пользователя\nLogin: " + userdate[0] + "\nИмя: " + userdate[1] + "\nID: " + socket.id));
			}
		var user_answer = '';
		for(var i in users)
			user_answer += users[i] + '&';
		io.emit('users_answer',user_answer);
		});
//При отключении пользователя им будет отправлено disconnectuser, в тч при обновлении вкладки, закрытии вкладки либо закрытии браузера
	socket.on('disconnectuser', function(user){
		userdate = user.split(';');
		for(k in users) {
			if(users[k].indexOf(userdate[0]) + 1) {
				delete users[k];
//+					console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
				}
			}
		delete iduser[socket.id];
		var user_answer = '';
		for(var i in users) 
			user_answer += users[i] + '&';
		io.emit('users_answer',user_answer);
		});
	socket.on('dialsips', function(num){ //тестовое переименование
		if(num!=='') {
//+				console.log(datetime() + 'dial ' + num);
			number = num.split(';');
			for(var i = 0; i < users.length; i++){
				if(users[i]!==undefined) {
//+						console.log(datetime() + 'отладка 1, массив юзеров:' + users[i]);
					user_arr = users[i].split(';');
					if(user_arr[2]==number[0]) {
						try {
							io.sockets.connected[user_arr[3]].emit('dialnotice', num);
//+								console.log(colors.magenta(datetime() + 'Уведомляю о звонке ' + num));
							} catch (e) {
//+								console.log('error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				}
			}
			else {
//+					console.log(datetime() + 'Уведомление dialsip не прошло:' + num);
			}
		});
	 socket.on('notices', function(num){
		 if(num!=='') {
//+				 console.log(datetime() + 'notices ' + num);
			 number = num.split(';');
			 for(var i = 0; i < users.length; i++){
				 if(users[i]!==undefined) {
					 user_arr = users[i].split(';');
					 if(user_arr[2]==number[0]) {
						 try {
							 io.sockets.connected[user_arr[3]].emit('notices_dial', number[1]);
//+								 console.log(colors.magenta(datetime() + 'Новое уведомление для ' + user_arr[1]));
							 } catch (e) {
//+								 console.log('error: ' + e.name +  ' - ' + e.message);
//+								 console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							 delete iduser[user_arr[3]];
							 var user_answer = '';
							 for(var i in users) 
								 user_answer += users[i] + '&';
							 io.emit('users_answer',user_answer);
							 }
						 }
					 }
				 }
			 } else {
//+				 console.log(datetime() + 'notices not found data');
			 }
		 }); 
/*	socket.on('dialsip', function(num){  //что-то спамит такими данными(на самом ассистенте проблемы нет, оригинальная функция переименована)
		 if(num!=='') {
//+				 console.log(datetime() + 'dialsip получены данные:');
			 } else {
//+				 console.log(datetime() + 'dialsip not found data');
			 }
		 }); */
	socket.on('notices_login', function(data_){
//+			console.log(colors.yellow(datetime() + 'notices ' + data_));
		if(data_!=='') {
			data = data_.split(';');
			for(var i = 0; i < users.length; i++){
				if(users[i]!==undefined) {
					user_arr = users[i].split(';');
					if(user_arr[0]==data[0]) {
						try {
							io.sockets.connected[user_arr[3]].emit('notices', data_);
//+								console.log(colors.magenta(datetime() + 'Новое уведомление для ' + user_arr[1]));
							} catch (e) {
//+								console.log('error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				}
			} else {
//+				console.log(datetime() + 'notices not found data');
			}
		});
/*	socket.on('dialqueue', function(num){
		if(num!=='') {
//+				console.log(datetime() + 'dialqueue ' + num);
			number = num.split(';');
			queueagent = number[0].split(',');
			for(var i = 0; i < users.length; i++){ 
				if(users[i]!==undefined) {
					user_arr = users[i].split(';');
					for(var q in queueagent) {
						if(user_arr[2]==queueagent[q]) {
							try {
								io.sockets.connected[user_arr[3]].emit('queuenotice', num);
//+									console.log(colors.magenta(datetime() + 'Уведомляю о звонке в отдел ' + num));
								} catch (e) {
//+									console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+									console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
								delete iduser[user_arr[3]];
								var user_answer = '';
								for(var i in users) 
									user_answer += users[i] + '&';
								io.emit('users_answer',user_answer);
								}
							}
						}
					}
				}
			} else {
//+				console.log(datetime() + 'dialqueue: failed');
			}
		}); */
	socket.on('dialqueue', function(num){ //тестовое переименование
		if(num!=='') {
//+				console.log(datetime() + 'dialqueue ' + num);
			number = num.split(';');
			for(var i = 0; i < users.length; i++){
				if(users[i]!==undefined) {
					user_arr = users[i].split(';');
					if(user_arr[2]==number[0]) {
						try {
							io.sockets.connected[user_arr[3]].emit('queuenotice', num);
//+								console.log(colors.magenta(datetime() + 'Уведомляю о звонке в отдел ' + num));
							} catch (e) {
//+								console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				}
			}
			else {
//+					console.log(datetime() + 'Уведомление dialqueue не прошло:' + num);
			}
		});
	socket.on('dialstatus', function(num){
		number = num.split(';');
		for(var i = 0; i < users.length; i++){
			if(users[i]!==undefined) {
				user_arr = users[i].split(';');
				if(user_arr[2]==number[0]) {
					if(iduser[user_arr[3]]!==undefined) {
						try {
							io.sockets.connected[user_arr[3]].emit('dialstatus_user', num);
//+								console.log(colors.cyan(datetime() + 'Уведомляю о статусе вызова ' + num));
							} catch (e) {
//+								console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0] + "\nID: " + user_arr[3]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				}
			}
		});
	socket.on('helpdesk', function(helpdesk){
		for(var i = 0; i < users.length; i++){
			if(users[i]!==undefined) {
				user_arr = users[i].split(';');
				helpdesks = helpdesk.split('&');
				if(helpdesks[3]) {
					if(user_arr[1]==helpdesks[1]) {
						try {
							io.sockets.connected[user_arr[3]].emit('helpdesk_user', helpdesk);
//+								console.log(colors.magenta(datetime() + 'Уведомляю пользователя о заявке helpdesk ' + helpdesk));
							} catch (e) {
//+								console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					if(user_arr[0]==helpdesks[2]) {
						try {
							io.sockets.connected[user_arr[3]].emit('helpdesk_technical', helpdesk);
//+								console.log(colors.magenta(datetime() + 'Уведомляю специалиста по заявке helpdesk ' + helpdesk));
							} catch (e) {
//+								console.log('error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				if(helpdesks[3]=='') {
					if(user_arr[0]=='andrei.lipinski' || user_arr[0]=='artem.pankratov') {
						try {
							io.sockets.connected[user_arr[3]].emit('helpdesk', helpdesk);
//+								console.log(colors.magenta(datetime() + 'Уведомляю о поступлении новой заявки helpdesk ' + helpdesk));
							} catch (e) {
//+								console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+								console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0]));
							delete iduser[user_arr[3]];
							var user_answer = '';
							for(var i in users) 
								user_answer += users[i] + '&';
							io.emit('users_answer',user_answer);
							}
						}
					}
				}
			}
		});
	socket.on('webzakazend',function(useres) {
		useres = useres.split('&');
		for(var i = 0; i < useres.length; i++){
			if(useres[i]!==undefined && useres[i]!=='') {
//+					console.log(colors.cyan(datetime() + "Запрос webzakazend: " + useres[i]));
				io.emit('webzakazend',useres[i]);
				}
			}
		});
	socket.on('webzakaz_nomany',function(useres) {
		useres = useres.split('&');
		for(var i = 0; i < useres.length; i++){
			if(useres[i]!==undefined && useres[i]!=='') {
//+					console.log(colors.cyan(datetime() + "Запрос webzakaz_nomany: " + useres[i]));
				io.emit('webzakaz_nomany',useres[i]);
				}
			}
		});
	/*Сообщение, кто на сайте, админам*/
	socket.on('users_question',function(){
//+			console.log(colors.cyan(datetime() + "Запрос users_question"));
		var user_answer = '';
		for(var i in users) {
			user_answer += users[i] + '&';
			}
		io.emit('users_answer',user_answer);
		});
	/*Разрыв всем сессии*/
	socket.on('logout', function () {
//+			console.log(colors.cyan(datetime() + "Logout всех пользователей"));
		io.emit('logout_user','');
		});
	/*Отправка сообщения пользователям сайта*/
	socket.on('messages', function (messages) {
		messages = messages.split('&');
		if(messages[1]=='') {
//+				console.log(colors.cyan(datetime() + "messages всем пользователей"));
			io.emit('messages_user',messages[0]);
			} else {
			for(var i = 0; i < users.length; i++){
				if(users[i]!==undefined) {
					user_arr = users[i].split(';');
					if(user_arr[0]==messages[1]) {
						if(iduser[user_arr[3]]!==undefined) {
							try {
//+									console.log(colors.cyan(datetime() + "messages пользователю " + messages[1]));
								io.sockets.connected[user_arr[3]].emit('messages_user', messages[0]);
								} catch (e) {
//+									console.log(datetime() + 'error: ' + e.name +  ' - ' + e.message);
//+									console.log(colors.yellow(datetime() + "Отключение пользователя\nLogin: " + userdate[0] + "\nID: " + user_arr[3]));
								delete iduser[user_arr[3]];
								var user_answer = '';
								for(var i in users) 
									user_answer += users[i] + '&';
								io.emit('users_answer',user_answer);
								}
							}
						}
					}
				}
			}
		});
	/*Обновление всем страницы*/
	socket.on('update', function () {
//+			console.log(colors.cyan(datetime() + "update всех пользователей"));
		io.emit('update_user','');
		});
	socket.on('meeting_room',function(data) {
//+			console.log(colors.cyan(datetime() + "meeting_room " + data));
		io.emit('meeting_room',data);
		});
	
	
	
	socket.on('commandapt', function (command) {
//+			console.log(colors.white(datetime() + "Команда на аптеки " + command));
		io.emit('commandapt',command);
		});
	socket.on('commandaptserver', function (command) {
//+			console.log(colors.white(datetime() + "Команда на сервера аптек " + command));
		io.emit('commandaptserver',command);
		});
	socket.on('aptanswer', function () {
//+			console.log(colors.white(datetime() + "Опрос аптек aptanswer"));
		io.emit('aptanswer','');
		});
	socket.on('aptanswered', function (apt) {
//+			console.log(colors.white(datetime() + "Ответ на опрос аптек " + apt));
		io.emit('aptanswered',apt);
		});
	socket.on('textapt',function(text) {
//+			console.log(colors.white(datetime() + "Состояние cmd аптеки " + text));
		io.emit('textapt',text);
		});
	});
