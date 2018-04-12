# IoCommander v1.0.0 - Техническая документация по работе с клиентом

## Запуск клиента

- Запускается загрузка файла конфигурации iocommander-usr.conf объектом ожидание (Promise) getSettings(). Если загрузка не была выполнена - работа клиента будет прекращена.
- Создается объект ожидание (Promise) getDatabase, где загружаются данные из storage.db (по сути JSON файл) в redux (clientStorage), если данные не были выгружены, повреждены - данные не выгружаются. При ошибке работы с хранилищем, его нужно удалить.
- Параллельно запускается сборщик мусора GarbageCollector с интервалом раз в час.
- Запускается вебсокет-клиент. Веб-сокет клиент пытается подключиться к вебсокет-серверу. Слушает сокет в случае успеха.
- При поступлении события whois - передает в сокет логин и хэш пароля. Слушает ответ сервера.
- Если авторизация не успешна, пробует авторизоваться повторно каждые 5 минут.
- Постоянно слушает сокет сервера на наличие новых заданий.
- Запускает обработчик заданий с интервалом в 15 секунд, который ищет актуальные задания и запускает их выполнение.
- Задание считается актуальным, если его статус "Не выполнено", "Выполнить после" меньше текущего времени и оно отсутствует в массиве уже выполняющихся заданий (статус исполняемой).

```
getSettings().then(function(value){
	if(value !== 'error'){
		user_global = value.login; 
		password_global = cryptojs.Crypto.SHA256(user_global + value.password+'icommander');
		server_global = value.server;
		var protocol_val = value.protocol,
		port_val = value.port;
		
		getDatabase().then(function (database){
			if(database !== 'error'){
				clientStorage.dispatch({type:'DB_SYNC', payload: database});
				console.log(colors.green(datetime() + "Синхронизация с базой данных выполнена!"));
			} else {
				console.log(colors.red(datetime() + "Синхронизация с базой данных не выполнена!"));
			}
			Reconnect(protocol_val, server_global, port_val);
			//очищаем задания, во время которых служба была остановлена
			fs.readdir('./temp/', function(err, items) {
				try{
					if (err) { 
						throw err;
					} else {
						for(var k = 0 ; k < items.length; k++){
							try {
								var thisuid = items[k].substr(0,items[k].length-5);
								taskOnComplete(socket, thisuid, 'Во время выполнения команды служба была остановлена!', 100);
								unlinkLockFile(thisuid);
								console.log(colors.yellow(datetime() + "Отменяю задачу " + thisuid + "!"));
							} catch(e){
								console.log(colors.red(datetime() + "Ошибка обработки файла блокировки " + items[k] + ": " + e));
							}
						}
						//проверяем задания каждые 15 сек
						setInterval(function(){
							try {
								var data_val = clientStorage.getState().tasks;
								if(typeof(data_val) === 'object'){
									try{
										if (err) { 
											throw err;
										} else {
											for(var key_val in data_val){
												try {
													if(typeof(data_val[key_val].timeoncompl) === 'undefined'){
														data_val[key_val].timeoncompl = 0;
													}
													if((data_val[key_val].complete !== 'true') && (testLockFile(key_val)) && (clientStorage.getState().complete.indexOf(key_val) === -1) &&  (data_val[key_val].timeoncompl < Date.now())){
														try {
															var flag = true;
															if(Array.isArray(data_val[key_val].dependencies)){
																for(var i = 0; i < data_val[key_val].dependencies.length; i++ ){
																	if(clientStorage.getState().incomplete.indexOf(data_val[key_val].dependencies[i]) !== -1){
																		flag = false;
																	}
																}
															}
															if(flag){
																console.log(colors.yellow(datetime() + "Найдено новое актуальное задание: " + key_val));
																createLockFile(key_val);
																runTask(socket, key_val, data_val).then(function(value){
																	unlinkLockFile(value.uid);
																}, function(error){
																	unlinkLockFile(key_val);
																});
															}
														} catch (e) {
															console.log(colors.red(datetime() + "Не могу обработать зависимости задания: " + e));
														}
													}
												} catch(e){
													console.log(colors.red(datetime() + "Ошибка выполнения задания: " + e));
												}
											}
										}
									} catch(e){
										console.log(colors.red(datetime() + "Ошибка чтения директории с файлами блокировки: "  + e));
									}
								} else {
									console.log(colors.red(datetime() + "Хранилище заданий не является объектом!"));
								}
							} catch(e){
								console.log(colors.red(datetime() + "Не могу получить список заданий из хранилища!"));
							}
						}, 15000);
					}
				} catch(e){
					console.log(colors.red(datetime() + "Ошибка чтения директории с файлами блокировки: "  + e));
				}
			});
			//запускаю сборщик мусора каждый час
			setInterval(GarbageCollector, 3600000);
		});
	}
}, function(error){
	console.log(colors.red(datetime() + "Ошибка инициализации!"));
});
```

## Хранилища данных

- При изменении redux(clientStorage) данные пишутся в storage.db с отсрочкой в 15 секунд. Т.е. устанавливается флаг (что данные ожидают записи), пока флаг установлен повторно данный процесс не запускается. Через 15 секунд функция делает снимок clientStorage и пытается записать данные в storage.db. В случае ошибки перезапустит себя через 15 секунд, в случае успеха сбросит флаг (что данные ожидают записи). Это позволяет синхронизировать данные только по факту изменений с одной стороны. С другой стороны не DOS-ить базу частыми запросами.

- По хранилищу раз в час проходит сборщик мусора и уничтожает не актуальные данные.

- Представлены постоянным хранилищем clientStorage.

- Редьюсер слушают dispatch в виде action:{type:TYPE, payload:{}}
  - TYPE - тип действия
  - payload - полезная нагрузка

- Редьюсер для clientStorage
  - ADD_TASK - добавляет задачу пользователю, payload:{}, {} - объект задачи(Object). 
  - TASK_COMPLETE - устанавливает задаче статус выполнено, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - TASK_INCOMPLETE - устанавливает задаче статус не выполнено, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - TASK_ERROR - устанавливает, что задача завершилась с ошибкой (счетчик попыток), payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - DB_SYNC - восстанавливает хранилище из storage.db, payload:{}, {} - хранилище clientStorage целиком(Object).
  - DB_CLEAR_TASK - уничтожает задачу, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - DB_CLEAR_COMPL - удаляет задачу из массива выполненных, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - DB_CLEAR_INCOMPL - удаляет задачу из массива не выполненных, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
  - DB_REPLANSW_TASK - обрезает слишком длинный (больше 500 символов) ответ задачи, payload:{uid:UID}, UID - уникальный идентификатор задачи(String). 
  - FORCE_ERROR - принудительная установка ошибки, payload:{uid:UID}, UID - уникальный идентификатор задачи(String).
```
function editStore(state = {tasks: {}, complete: [], incomplete:[]}, action){
	try {
		switch (action.type){
			case 'ADD_TASK':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid] = action.payload.task;
				return state_new;
				break;
			case 'TASK_COMPLETE':
				var state_new = lodash.clone(state);
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
				return state_new;
				break;
			case 'TASK_INCOMPLETE':
				var state_new = lodash.clone(state);
				if(clientStorage.getState().incomplete.indexOf(action.payload.uid) === -1){
					state_new.incomplete.push(action.payload.uid);
				}
				if(clientStorage.getState().complete.indexOf(action.payload.uid) !== -1){
					state_new.complete.splice(clientStorage.getState().complete.indexOf(action.payload.uid),1);
				}
				return state_new;
				break;
			case 'TASK_ERROR':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].tryval = state.tasks[action.payload.uid].tryval + 1;
				return state_new;
				break;
			case 'DB_SYNC':
				var state_new = action.payload;
				return state_new;
				break;
			case 'DB_CLEAR_TASK':
				var state_new = lodash.clone(state);
				delete state_new.tasks[action.payload.uid];
				console.log(colors.yellow(datetime() + "Удаляю задание с истекшим сроком: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_COMPL':
				var taskid = state.complete.indexOf(action.payload.uid);
				var state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.complete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива complete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_CLEAR_INCOMPL':
				var taskid = state.incomplete.indexOf(action.payload.uid);
				var state_new = lodash.clone(state);
				if(taskid !== -1){
					state_new.incomplete.splice(taskid, 1);
				}
				console.log(colors.yellow(datetime() + "Удаляю из массива incomplete, несуществующее задание: "  + action.payload.uid));
				return state_new;
				break;
			case 'DB_REPLANSW_TASK':
				var state_new = lodash.clone(state);
				var thisanswr = state.tasks[action.payload.uid].answer;
				state_new.tasks[action.payload.uid].answer = '...' + thisanswr.substring(thisanswr.length - 501,thisanswr.length - 1);
				return state_new;
				break;
			case 'FORCE_ERROR':
				var state_new = lodash.clone(state);
				state_new.tasks[action.payload.uid].tryval = 100;
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
```

## Функции

### Получение настроек конфигурационного файла

##### Описание
Загружает данные из файла конфигурации

##### Входящие параметры
undefined

##### Возвращаемое значение 
Promise

##### Исходный код
```
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
```

### Получение данных из storage.db

##### Описание
Загружает данные из внешнего хранилища

##### Входящие параметры
undefined

##### Возвращаемое значение 
Promise

##### Исходный код
```
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
```

### Запись данных в storage.db

##### Описание
Записывает данные из redux в storage.db

##### Входящие параметры
undefined

##### Возвращаемое значение 
undefined

##### Исходный код
```
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
```

### Авторизация в сокете

##### Описание
Отправляет событие авторизации, логин и хэш пароля в сокет

##### Входящие параметры
socket - объект socket.io (Object)

##### Возвращаемое значение 
undefined

##### Исходный код
```
function login(socket) {
	try {
		if(typeof(socket) === 'object'){
			socket.emit('login', { user: user_global, password: password_global });
		} else {
			console.log(colors.red(datetime() + "Аргумент сокет не является объектом!"));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Сокет не инициализирован!"));
	}
}
```

### Функция генерации таймштампа

##### Описание
Генерирует метку времени для вывода в консоль.

##### Входящие параметры
undefined

##### Возвращаемое значение 
String

##### Исходный код

```
function datetime() {
	try {
		var dt = new Date();
		return '[' + dt.getDate() + '.' + (dt.getMonth()+1) + '.' + dt.getFullYear() + ' - ' + dt.getHours() + '.' + dt.getMinutes() + '.' + dt.getSeconds() + '] ';
	} catch(e) {
		console.log(colors.red("Проблема с функцией datetime()!"));
	}
}
```

### Функция работы соединения с сокетом

##### Описание
Соединяется с сокетом, запускает функцию авторизации в сокете, функцию прослушки сокета.

##### Входящие параметры
protocol_val = протокол сокет сервера http или https (String)
server_val = адрес сокет-сервера (String)
port_val = порт подключения к сокет-серверу (Integer)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function Reconnect(protocol_val, server_val, port_val){
	try {
		if(typeof(socket) !== 'undefined'){
			try{
				socket.disconnect();
			}catch(e){
				console.log(colors.red(datetime() + "Не могу уничтожить сокет!"));
			}
		} 
		if(protocol_val === 'https'){
			socket = socketclient.connect(protocol_val + '://' + server_val + ':' + port_val, {secure:true, transports: ['websocket']});
		} else {
			socket = socketclient.connect(protocol_val + '://' + server_val + ':' + port_val, {transports: ['websocket']});
		}
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
				setTimeout(Reconnect, 300000, protocol_val, server_val, port_val);
			}
		});
		//слушаем сокет
		listenSocket(socket, protocol_val, server_val, port_val);
	}catch(e){
		console.log(colors.red(datetime() + "Ошибка подключения к сокету: " + e));
		setTimeout(Reconnect, 300000, protocol_val, server_val, port_val);
	}
}
```

### Функция работы с сокетом

##### Описание
Слушает сокет на событие получения заданий, анализирует статус выполнения заданий. В случае расхождения статусов, отправит актуальный в сокет. Добавляет новые задачи.

##### Входящие параметры
socket - объект socket.io (Object)
protocol_val = протокол сокет сервера http или https (String)
server_val = адрес сокет-сервера (String)
port_val = порт подключения к сокет-серверу (Integer)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function listenSocket(socket, protocol_val, server_val, port_val){
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
```

### Задание скачать файл в папку

##### Описание
Анализирует тип операционной системы. В соответствии с типом изменяет путь:
- для win32 пусть начинается с C:\
- для linux /
Скачивает файл по ссылке в заданную папку на диске, если полученное значение платформы соответствует данной операционной системе или all.

##### Входящие параметры
socket - объект socket.io (Object)
uid_val - уникальный идентификатор задачи (String)
extPath - ссылка для скачки файла (String)
intPath - путь к папке на диске (String)
fileName - имя файла для загруки (String)
platform - тип платформы (операционной системы), win32, linux или all (String)

##### Возвращаемое значение 
Promise

##### Исходный код

```
function writeFile(socket, uid_val, extPath, intPath, fileName, platform){
	return new Promise(function(resolve){
		try {
			if((platform === 'all') || (platform === os.platform())){
				switch (os.platform()) {
					case "win32":
						intPath = 'c:' + intPath;
						var options = {
							directory: intPath.replace(/\\/gi, '/'),
							filename: fileName,
							timeout: 60000
						};
						var errors = 0;
						download(extPath, options, function(error){
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									taskOnComplete(socket, uid_val, 'Файл скачан!');
									console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(e) {
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var options = {
							directory: intPath.replace(/\\/gi, '/'),
							filename: fileName,
							timeout: 60000
						};
						var errors = 0;
						download(extPath, options, function(error){
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									taskOnComplete(socket, uid_val, 'Файл скачан!');
									console.log(colors.green(datetime() + "Скачан файл " + extPath + " в директорию " + intPath + fileName + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(e) {
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, e);
								}
								console.log(colors.red(datetime() + "Ошибка загрузки файла " + extPath + " в директорию " + intPath + fileName + ":" + e));
								resolve({type:"error",uid:uid_val});
								return;
							}
						});
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve({type:"error",uid:uid_val});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e) {
			console.log(colors.red(datetime() + "Не могу скачать файл в директорию, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}
```

### Запуск исполняемого файла

##### Описание
Анализирует тип операционной системы. В соответствии с типом изменяет путь:
- для win32 пусть начинается с C:\
- для linux /
Если полученный тип платформы соответствует данной операционной системе или all, запускает скрипт. В случае linux предварительно устанавливает права на файл 777 (rwxrwxrwx).

##### Входящие параметры
socket - объект socket.io (Object)
uid_val - уникальный идентификатор задачи (String)
intPath - путь к папке на диске (String)
fileName - имя скрипта для выполнения (String)
paramArray - массив параметров скрипта (Array)
platform - тип платформы (операционной системы), win32, linux или all (String)

##### Возвращаемое значение 
Promise

##### Исходный код

```
function execFile(socket, uid_val, intPath, fileName, paramArray, platform){
	return new Promise(function(resolve){
		try {
			if((platform === 'all') || (platform === os.platform())){
				switch (os.platform()) {
					case "win32":
						if (intPath !== ""){
							intPath = 'c:' + intPath;
						}
						var errors = 0;
						var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, {encoding:'cp866'}, (error, stdout, stderr) => {
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											returnAnswer = 'Результат: ' + (stdout) + ' \n ' + 'Ошибок: ' + (stderr);
										} else {
											returnAnswer = 'Ошибки: ' + (stderr);
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										returnAnswer = 'Результат: ' + (stdout);
									} else {
										returnAnswer = '';
									}
									taskOnComplete(socket, uid_val, returnAnswer);
									console.log(colors.yellow(datetime() + "Запущен файл " + (intPath.replace(/\\/gi, '/') + fileName) + ' ' + paramArray + "!"));
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var errors = 0;
						fs.chmod((intPath.replace(/\\/gi, '/') + fileName), 0777, (error) =>{
							try{
								if (error) {
									throw error;
								} else if(errors === 0){
									var errorsinc = 0;
									var child = child_process.execFile((intPath.replace(/\\/gi, '/') + fileName), paramArray, (error, stdout, stderr) => {
										try{
											if (error) {
												throw error;
											} else if(errorsinc === 0){
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
												resolve({type:"ok",uid:uid_val});
											}
										} catch(error){
											errorsinc++;
											if(clientStorage.getState().tasks[uid_val].tryval < 100){
												clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
											} else {
												taskOnComplete(socket, uid_val, error);
											}
											console.log(colors.red(datetime() + "Ошибка выполнения скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
											resolve({type:"error",uid:uid_val});
										}
									}); 
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error);
								}
								console.log(colors.red(datetime() + "Ошибка изменения прав скрипта " + intPath + '/' + fileName + ' ' + paramArray[0] + ":" + error));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					default:
						taskOnComplete(socket, uid_val);
						console.log(colors.green(datetime() + "Неизвестный тип платформы " + os.platform() + " !"));
						resolve({type:"error",uid:uid_val});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e){
			console.log(colors.red(datetime() + "Не могу запустить файл, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}
```

### Выполнение команды в shell/cmd

##### Описание
Если полученный тип платформы соответствует данной операционной системе или соответствует all, то выполняет команду в командной строке операционной системы.

##### Входящие параметры
socket - объект socket.io (Object)
uid_val - уникальный идентификатор задачи (String)
execCommand - команда для выполнения (String)
platform - тип платформы (операционной системы), win32, linux или all (String)

##### Возвращаемое значение 
Promise

##### Исходный код

```
function execProcess(socket, uid_val, execCommand, platform){
	return new Promise(function(resolve){
		try{
			if((platform === os.platform()) || (platform === 'all')){
				var errors = 0;
				switch (os.platform()){
					case 'win32':
						var child = child_process.exec(execCommand, {encoding:'cp866'}, (error, stdout, stderr) => {
							try {
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											returnAnswer = 'Результат: ' + stdoutOEM866toUTF8(stdout) + ' \n ' + 'Ошибок: ' + stdoutOEM866toUTF8(stderr);
										} else {
											returnAnswer = 'Ошибок: ' + stdoutOEM866toUTF8(stderr);
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										returnAnswer = 'Результат: ' + stdoutOEM866toUTF8(stdout);
									} else {
										returnAnswer = '';
									}
									console.log(returnAnswer);
									taskOnComplete(socket, uid_val, returnAnswer);
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, stdoutOEM866toUTF8(error));
								}
								console.log(colors.red(datetime() + "Ошибка выполнения команды " + execCommand + ":" + stdoutOEM866toUTF8(error)));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
					case 'linux':
						var child = child_process.exec(execCommand, (error, stdout, stderr) => {
							try {
								if (error) {
									throw error;
								} else if(errors === 0){
									if((typeof(stderr) !== 'undefined') && (stderr !== '')){
										if((typeof(stdout) !== 'undefined') && (stdout !== '')){
											returnAnswer = 'Результат: ' + stdout + ' \n ' + 'Ошибок: ' + stderr;
										} else {
											returnAnswer = 'Ошибок: ' + stderr;
										}					
									} else if((typeof(stdout) !== 'undefined') && (stdout !== '')){
										returnAnswer = 'Результат: ' + stdout;
									} else {
										returnAnswer = '';
									}
									taskOnComplete(socket, uid_val, returnAnswer);
									resolve({type:"ok",uid:uid_val});
								}
							} catch(error){
								errors++;
								if(clientStorage.getState().tasks[uid_val].tryval < 100){
									clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
								} else {
									taskOnComplete(socket, uid_val, error);
								}
								console.log(colors.red(datetime() + "Ошибка выполнения команды " + execCommand + ":" + error));
								resolve({type:"error",uid:uid_val});
							}
						});
						break;
				}
			} else {
				taskOnComplete(socket, uid_val, 'Другая операционная система!');
				console.log(colors.green(datetime() + "Команда для другой платформы!"));
				resolve({type:"ok",uid:uid_val});
			}
		} catch (e){
			if(clientStorage.getState().tasks[uid_val].tryval < 100){
				clientStorage.dispatch({type:'TASK_ERROR', payload: {uid:uid_val}});
			} else {
				taskOnComplete(socket, uid_val, e);
			}
			console.log(colors.red(datetime() + "Не могу выполнить команду, по причине:" + e));
			resolve({type:"error",uid:uid_val});
		}
	});
}
```

### Функция изменения состояния задачи на выполнено

##### Описание
Устанавливает статус задачи в выполнено, отправляет отчет о выполнении в сокет.

##### Входящие параметры
socket - объект socket.io (Object)
uid_val - уникальный идентификатор задачи (String)
answer_val - отчет о выполнении (String)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function taskOnComplete(socket, uid_val, answer_val, forceerr){
	var realAnswer = 'none';
	var TryVal = 0;
	try {
		if((typeof(answer_val) !== 'string') && (typeof(answer_val) !== 'undefined') && (answer_val !== '')){
			realAnswer = answer_val.toString();
		} else if (typeof(answer_val) === 'string'){
			realAnswer = answer_val;
		}
		if(realAnswer.length > 503){
			realAnswer =  '...' + realAnswer.substring(realAnswer.length - 501 ,realAnswer.length - 1);
		}
	} catch (e){}
	try {
		clientStorage.dispatch({type:'TASK_COMPLETE', payload: {uid:uid_val, answer:realAnswer}});
		console.log(colors.green(datetime() + "Задание " + uid_val + " выполнено!"));
	} catch (e){
		console.log(colors.red(datetime() + "Не могу изменить состояние таска, по причине:" + e));
	}
	try {
		if(typeof(clientStorage.getState().tasks[uid_val].tryval) !== 'undefined'){
			TryVal = clientStorage.getState().tasks[uid_val].tryval;
		}
		if(forceerr === 100){ //принудительно выставляем 100 (ошибку)
			TryVal = 100;
			clientStorage.dispatch({type:'FORCE_ERROR', payload: {uid:uid_val}});
		}
		socket.emit('completetask', { uid: uid_val, answer:realAnswer, tryval: TryVal});
	} catch (e){
		console.log(colors.red(datetime() + "Не могу отправить отчет о задании в сокет, по причине:" + e));		
	}
}
```

### Функция запуска выполнения задачи

##### Описание
Анализирует состояние задачи (выполняется ли она, статус выполнения, отсрочку выполнения), анализирует тип задачи и запускает соответствующую функцию для выполнения задачи.

##### Входящие параметры
socket - объект socket.io (Object)
key - уникальный идентификатор задачи (String)
data - объект массива задач (Object)

##### Возвращаемое значение 
Promise

##### Исходный код

```
function runTask(socket, key, data){
	try {
		if((data[key].complete !== 'true') && (clientStorage.getState().complete.indexOf(key) === -1) && (data[key].timeoncompl < Date.now())) {
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
					return new Promise(function(resolve){resolve({type:"error",uid:key});});
					break;
			}	
		}
	} catch (e) {
		console.log(colors.red(datetime() + "Не могу выполнить задание, по причине:" + e));
		return new Promise(function(resolve){resolve({type:"error",uid:key});});
	}
}
```

### Сборщик мусора

##### Описание
Если у задачи нет отсрочки, то уничтожает задачи старше 10 дней от даты создания, иначе уничтожает задачи старше 10 дней от даты отсрочки. Обрезает слишком длинные ответы задач. Исправляет рассинхронизацию массивов выполненных и не выполненных задач.

##### Входящие параметры
undefined

##### Возвращаемое значение 
undefined

##### Исходный код

```
function GarbageCollector(){
	var lifetime = 86400000 * 10; //устанавливаю срок хранения локальных данных в 10 дней
	var actualStorage = clientStorage.getState();
	try{
		try{
			for(var keyTask in actualStorage.tasks){
				try{
					if((actualStorage.tasks[keyTask].datetime + lifetime) < Date.now()){ //если у задания нет отсрочки, оно будет уничтожено через 10 дней. если есть отсрочка, то через 10 дней после даты отсрочки.
						if(typeof(actualStorage.tasks[keyTask].timeoncompl) !== 'undefined'){
							if((actualStorage.tasks[keyTask].timeoncompl + lifetime) < Date.now()){
								clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
							}
						} else {
							clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
						}
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
			var items = fs.readdirSync('./temp/');
			try {
				if(typeof(items) === 'object'){
					for (var i=0; i<items.length; i++) {
						try {
							var thisuid = items[i].substring(0, items[i].length -5);
							if(typeof(actualStorage.tasks[thisuid]) === 'undefined'){
								unlinkLockFile(thisuid);
							} else {
								if(actualStorage.tasks[thisuid].complete === 'true'){
									unlinkLockFile(thisuid);
								}
							}
						} catch(e){
							console.log(colors.red(datetime() + "Ошибка обработки файла " + items[i] + " сборщиком мусора: "  + e));
						}
					}
				}
			} catch(e){
				console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Неустранимая ошибка в работе сборщика мусора: "  + e));
	}
}
```

### Функция скачки файла

##### Описание
Модифицированная библиотека download-file для работы с собственным file-сервером с авторизацией. Определяет линк сервера, если он соответствует сокет-серверу, то будет использована Basic авторизация. В зависимости от протокола использует http или https юиюлиотеку, скачивает файл в заданную папку (в случае присутствия файла с таким же именем, он будет затерт). Принимает имя файла и каталог для сохранения в качестве входящих аргументов. Принимает Content-length в качестве количества байт входящего потока для контроля размера файла.

##### Входящие параметры
file - ссылка для скачки (String)
options - опции скачки {directory:DIR, filename: FILENAME, timeout: TIMEOUT} (Object), где DIR - директория для скачки (String), FILENAME - имя файла для (может отличаться от оригинального) (String), TIMEOUT - таймаут запроса (Integer)
callback - функция обратного вызова (Function)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function GarbageCollector(){
	var lifetime = 86400000 * 10; //устанавливаю срок хранения локальных данных в 10 дней
	var actualStorage = clientStorage.getState();
	try{
		try{
			for(var keyTask in actualStorage.tasks){
				try{
					if((actualStorage.tasks[keyTask].datetime + lifetime) < Date.now()){ //если у задания нет отсрочки, оно будет уничтожено через 10 дней. если есть отсрочка, то через 10 дней после даты отсрочки.
						if(typeof(actualStorage.tasks[keyTask].timeoncompl) !== 'undefined'){
							if((actualStorage.tasks[keyTask].timeoncompl + lifetime) < Date.now()){
								clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
							}
						} else {
							clientStorage.dispatch({type:'DB_CLEAR_TASK', payload: {uid:keyTask}});
						}
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
			var items = fs.readdirSync('./temp/');
			try {
				if(typeof(items) === 'object'){
					for (var i=0; i<items.length; i++) {
						try {
							var thisuid = items[i].substring(0, items[i].length -5);
							if(typeof(actualStorage.tasks[thisuid]) === 'undefined'){
								unlinkLockFile(thisuid);
							} else {
								if(actualStorage.tasks[thisuid].complete === 'true'){
									unlinkLockFile(thisuid);
								}
							}
						} catch(e){
							console.log(colors.red(datetime() + "Ошибка обработки файла " + items[i] + " сборщиком мусора: "  + e));
						}
					}
				}
			} catch(e){
				console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
			}
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка чтения сборщиком мусора директории с файлами блокировки: "  + e));
		}
	} catch(e){
		console.log(colors.red(datetime() + "Неустранимая ошибка в работе сборщика мусора: "  + e));
	}
}

//измененная библиотека download-file для работы с собственным file-сервером
function download(file, options, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
	}
	try{
		if (!file) throw("Need a file url to download");
		options = typeof options === 'object' ? options : {};
		options.timeout = options.timeout || 20000;
		options.directory = options.directory ? options.directory : '.';
		var uri = file.split('/');
		options.filename = options.filename || uri[uri.length - 1];
		var path = options.directory + "/" + options.filename;
		if (url.parse(file).protocol === null) {
			req = http;
		} else if (url.parse(file).protocol === 'https:') {
			req = https;
		} else {
			req = http;
		}
		var getoptions = url.parse(file); 
		if((typeof(server_global) !== 'undefined') && (typeof(user_global) !== 'undefined') && (typeof(password_global) !== 'undefined')){
			if(url.parse(file).hostname === server_global){
				getoptions.auth = user_global + ':' + password_global;
			}
		}
		var request = req.get(getoptions, function(response) {
			if (response.statusCode === 200) {
				mkdirp(options.directory, function(err) { 
					if (err) throw err;
					var file = fs.createWriteStream(path);
					response.pipe(file);
				});
			} else {
				if (callback) callback(response.statusCode);
			}
			response.on("end", function(){
				if((typeof(response.headers['content-length']) !== 'undefined') && (response.headers['content-length'] !== '')){
					try {
						var stats = fs.statSync(path);
						if (stats.isFile()) {
							if(stats.size.toString() !== response.headers['content-length']){
								throw 'File not full(down:' + stats.size.toString() + '/' + response.headers['content-length'] + ')!';
							} else {
								if (callback) callback(false, path);
							}
						} else {
							throw 'Not Found';
						}
					}catch(e){
						callback(e);
					}
				} else if (callback) callback(false, path);
			});
			request.setTimeout(options.timeout, function () {
				request.abort();
				callback("Timeout");
			});
		}).on('error', function(e) {
			if (callback) callback(e);
		});
	}catch(e) {
		callback(e);
	}
}
```

### Функция создания файла блокировки

##### Описание
При запуске задачи создает файл в папке ./temp/ с именем ${UID}.lock (необходимо для отслеждивания задач на которых сервис упал)

##### Входящие параметры
uid_val - уникальный идентификатор задачи (String)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function unlinkLockFile(uid_val){
	if(fs.existsSync('./temp/'+uid_val+'.lock')){
		try {
			fs.unlinkSync('./temp/'+uid_val+'.lock');
			console.log(colors.green(datetime() + "Удалена блокировка задачи (" + uid_val + ")!"));
		} catch(e){
			console.log(colors.red(datetime() + "Ошибка удаления файла блокировки: "  + e));
		}
	} else {
		console.log(colors.red(datetime() + "Файл блокировки (" + uid_val+'.lock' + ") не существует!"));
	}
}
```

### Функция создания файла блокировки

##### Описание
При ошибке или успешном выполнении задачи удаляет файл в папке ./temp/ с именем ${UID}.lock

##### Входящие параметры
uid_val - уникальный идентификатор задачи (String)

##### Возвращаемое значение 
undefined

##### Исходный код

```
function createLockFile(uid_val){
	if(!fs.existsSync('./temp/'+uid_val+'.lock')){
		try {
			fs.writeFileSync('./temp/'+uid_val+'.lock', Date.now());
			console.log(colors.green(datetime() + "Добавлена блокировка задачи (" + uid_val + ")!"));
		} catch(e){
			console.log(colors.red(datetime() + "Не могу записать файл блокировки:" + e));
		}
	} else {
		console.log(colors.red(datetime() + "Файл блокировки (" + uid_val +'.lock' + ") уже существует!"));
	}
}
```

### Функция проверки наличия файла блокировки

##### Описание
Проверяет, есть ли файл в каталоге ./temp/ с именем ${UID}.lock

##### Входящие параметры
uid_val - уникальный идентификатор задачи (String)

##### Возвращаемое значение 
Boolean

##### Исходный код

```
function testLockFile(uid_val){
	try {
		return !fs.existsSync('./temp/' + uid_val + '.lock');
	} catch(e){
		console.log(colors.red(datetime() + "Ошибка проверки файла блокировки:" + e));
		return false;
	}
}
```

### Функция преобразования кодировки OEM866 в UTF-8

##### Описание
Необходима для корректного отображения отчетов из windows, при ошибке вернет исходный текст.

##### Входящие параметры
value - строка в OEM866 (String)

##### Возвращаемое значение 
String

##### Исходный код

```
function stdoutOEM866toUTF8(value){
	try {
		return iconv.decode(new Buffer(new Buffer(iconv.decode(value, 'cp866')), 'utf8'), 'utf8');
	} catch(e){
		return value;
	}
}
```
