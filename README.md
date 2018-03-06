# IoCommander v1.0.0
### Приложение для отправки команд удаленным клиентам через socket.io. Функционал написан на серверном javascript и представлен:

+ Скрипт сервера (настройки в файле "src-server\iocommander-server.conf", запуск "node .\src-server\iocommander-server.js"), который 
  ++  Поднимает два сервера: 
    +++    web-сервер (веб-приложение панели управления, написанное на react + redux + socket.io) - в разработке
    +++    socket-сервер (основной сервер приложения)
  ++  Имеет два хранилища redux:
    +++    хранилище соединений (хранит связки uid-name|name-uid для активных соединений)
    +++    хранилище данных (хранит данные для авторизации клиентов и администраторов, задачи для клиентов)
  ++  Имеет хранилище firebase, из которого загружается объект в хранилище данных при старте сервера. При каждом изменении объект заново отправляется в firebase. (можно реализовать запись по интервалу)
  ++  Умеет создавать задачи (на данный момент три вида) для удаленных клиентов:
    +++    скачать файл по ссылке в заданную папку (платформонезависимо, путь относительно диска C для win32 или / для linux):
```
	var task1 = {uid:generateUID(), task: {nameTask:'getFileFromWWW', extLink:'http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm', intLink:'/test/', fileName: '1.rpm', exec:'false'}};
	setTask('fitobel.apt01', task1);
```
    +++    запустить скрипт на удаленном клиенте (платформонезависимо, путь относительно диска C для win32 или / для linux):
```
	var task2 = {uid:generateUID(), task: {nameTask:'execFile', intLink:'', fileName: 'node', paramArray:['--version']}};
	setTask('fitobel.apt01', task2);
```
    +++    выполнить команду в shell удаленного клиента (платформозависимо, тип платформы передается аргуметом platform: linux/win32):
```
	var task3 = {uid:generateUID(), task: {nameTask:'execCommand', execCommand:'echo "111"', platform:'win32'}};
	setTask('fitobel.apt01', task3);
```
  ++  Умеет получать статус выполнения, вышеуказанных команд.
  ++  Умеет получать обратную связь от команды запуска скрипта и выполнения команды.
  ++  Хранит актуальные состояния авторизованных клиентов.
  ++  Использует SHA-1 шифрование с солью, для хранения паролей.
  ++  Умеет создавать, удалять и обновлять пароль пользователей:
```
	setUser('fitobel.apt01', 'password', cryptojs.Crypto.SHA1('password'+'icommander')); //создать или изменить пароль существующего пользователя
	
	serverStorage.dispatch({type:'REMOVE_USER', payload: {user:'fitobel.apt01'}});
	connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:'fitobel.apt01'}});  //удалить пользователя
```
  ++  Умеет создавать, удалять и обновлять пароль администраторов:
```
	setAdmin('serg.dudko', 'password', cryptojs.Crypto.SHA1('password'+'icommander')); //создать или изменить пароль существующего пользователя
	
	serverStorage.dispatch({type:'REMOVE_ADMIN', payload: {user:'serg.dudko'}});
	connectionStorage.dispatch({type:'REMOVE_USER', payload: {user:'serg.dudko'}});  //удалить пользователя, в хранилище соединений тип экшн для редьюсера именно REMOVE_USER
```
  ++  Для администраторов умеет слушать и выполнять команды:
    +++    Добавление пользователя
```
	socket.emit('adm_setUser', ['fitobel.apt15', Crypto.SHA1('password')])
```
    +++    Удаление пользователя
```
	socket.emit('adm_delUser', ['fitobel.apt15'])
```
    +++    Добавление администратора
```
	socket.emit('adm_setAdmin', ['serg.dudko', Crypto.SHA1('password')])
```
    +++    Добавление администратора
```
	socket.emit('adm_delAdmin', ['serg.dudko'])
```
    +++    Добавление задачи
```
	socket.emit('adm_setTask', ['fitobel.apt15', {uid:generateUID(), task: {nameTask:'execFile', intLink:'', fileName: 'node', paramArray:['--version']}}])
```

+ Скрипт клиента (настройки в файле "src-user\iocommander-usr.conf", запуск "node .\src-user\iocommander-usr.js"), который:
  ++  Соединяется с сокетом-сервера и авторизуется в нем.
  ++  Слушает сокет сервера на наличие заданий, на данный момент 3 вида (описаны выше).
  ++  Умеет скачивать файлы.
  ++  Умеет работать с файловой системой.
  ++  Умеет запускать скрипты и отправлять обратную связь в сокет.
  ++  Умеет выполнять команды в shell и отправлять обратную связь в сокет.
  ++  При разрыве соединения автоматически восстанавливает его.
  
+ Веб-панель администратора (в разработке)
  ++  Умеет авторизовавыться в сокете
  ++  Автоматически получает измененные данные из сокета (два аналогичных серверу хранилища)