# IoCommander v1.1.3 - Установка сервера

## Создание проекта firebase

- Создаете новый проект по адресу https://console.firebase.google.com

![Screenshot_1](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_1.png)

- Вводите название проекта и страну

![Screenshot_2](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_2.png)

- Выбираете Разработка/Авторизация

![Screenshot_3](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_3.png)

![Screenshot_4](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_4.png)

- Выбираете способы входа и включаете вход по адресу электронной почты и паролю

![Screenshot_5](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_5.png)

- Выбираете пользователи и создаете нового

![Screenshot_6](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_6.png)

- Выбираете Базы данных/База данных реального времени

![Screenshot_7](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_7.png)

- Выбираете правила и задаете права на чтение/запись только для созданного выше пользователя:

![Screenshot_8](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_8.png)

```
{
	"rules": {
		".read": "(auth.email == 'admin@sergdudko.tk')",
		".write": "(auth.email == 'admin@sergdudko.tk')"
	}
}
```

- Заходите в настройки/настройки проекта

- Запоминаете Идентификатор проекта и ключ апи веб-приложения

![Screenshot_9](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_9.png)

## Зависимости проекта

- socket.io
- http
- https
- colors
- fs
- cryptojs
- redux
- lodash
- firebase
- multiparty
- os

## Настройка проекта

- Копируете файлы проекта, например в папку /home/iocommander/*

  - ./src-server/* - файлы сервера
  - ./src-adm/* - панель администрирования

- Создаете каталог ./files/ для файлового сервера

- Создаете/редактируете файл настроек ./src-server/iocommander-server.conf

```
{
"port": "444",
"webport": "8000",
"fileport": "500",
"firebase_user": "admin@sergdudko.tk",
"firebase_pass": "Nw5ld4S8cCgBJKhde7NOS2aQIa72",
"firebase_config": {
	"apiKey": "AIzaSyCKP0rai4BwWPGuUWAQc8QOtWNHBcBMWsg",
	"authDomain": "syncftp3.firebaseapp.com",
	"databaseURL": "https://syncftp3.firebaseio.com",
	"storageBucket": "syncftp3.appspot.com"
	},
"sslkey":"/etc/webmin/letsencrypt-key.pem",
"sslcrt":"/etc/webmin/letsencrypt-cert.pem",
"sslca":"/etc/webmin/letsencrypt-ca.pem",
"bantimeout":"10800000"
"env":{
		"ps1":{
			"link":"",
			"com":"powershell",
			"param":"-ExecutionPolicy bypass   -file "
			},
		"sql":{
			"link":"",
			"com":"sqlcmd",
			"param":"-U ***** -P **** -d aptekajet -i "
		},
		"cmd":{
			"link":"",
			"com":"cmd",
			"param":"/C "
		},
		"bat":{
			"link":"",
			"com":"cmd",
			"param":"/C "
		},
		"sh":{
			"link":"",
			"com":"bash",
			"param":""
		}
	}
}
```

  - port - порт сокет-сервера
  - webport - порт панели администрирования
  - fileport - порт файлового сервера
  - firebase_user - пользователь, которого мы создали в firebase
  - firebase_pass - пароль пользователя в firebase
  - apiKey - ключ api для веб-приложения
  - в трех ссылках (authDomain, databaseURL, storageBucket) заменить test-612c2 на ваш идентификатор проекта
  - sslkey, sslcrt, sslca - пути к сертификатам и ключу. Если хоть один параметр пуст, то сервер будет http/ws. Если заполнены, то сервер https/wss.
  - env - переменные окружения, где [ps1,sql,cmd] - типы файлов, в которых link - путь к интерпретатору, com - имя интерпретатора, param - параметры запуска (должны заканчиваться на пробел, после которого будет следовать путь к скрипту). Можно не указывать путь и разрешение, если интерпретатор находится в папке системных переменных (по умолчанию для windows C:\Windows\System32, для Linux /bin/)
  - bantimeout - таймаут блокировки при введении неверного пароля 5 раз, в мс.
  
- Отладка переменных окружения env из файла конфигурации. Разберем на примере скрипта mssql:
```
"sql":{
	"link":"",
	"com":"sqlcmd",
	"param":"-U ***** -P **** -d **** -i "
}
//аналог команды: "sqlcmd -U **you_username** -P **you_password** -d **you_database** -i C:\..you_path..\script.sql"
```
  - для сопоставления с переменной окружения файл должен быть *.sql
  - для корректной отработки файл должен запускаться из командной строки как sqlcmd -U **you_username** -P **you_password** -d **you_database** -i C:\..you_path..\script.sql
  - путь к интерпретатору можно не прописывать для exe файлов в папке переменных окружения, например system32 для windows или /bin/ для linux. А можно прописать, тогда конфиг будет вида:
```
"sql":{
	"link":"C:\\Windows\\System32\\",
	"com":"sqlcmd.exe",
	"param":"-U ***** -P **** -d **** -i "
}
//аналог команды: "C:\Windows\System32\sqlcmd.exe -U **you_username** -P **you_password** -d **you_database** -i C:\..you_path..\script.sql"
```
  - последним аргументом будет ваш скрипт (скачанный или переданный), т.е. если это необходимо - нужно добавить параметр ссылающийся на скрипт с пробелом на конце "-i ".
  - параметры могут быть опущены, если интерпретатор запускает скрипт без параметров, например bash:
```
"sh":{
	"link":"",
	"com":"bash",
	"param":""
}
//аналог команды: "bash /..you_path../script.sh"
```
  - а вот cmd.exe уже необходимо обозначить входящий скрипт
```
"bat":{
	"link":"",
	"com":"cmd",
	"param":"/C "
}
//аналог команды: "cmd /C C:\..you_path..\script.bat"
```

- Устанавливаете nodejs, например в CentOS 7.x он устанавливается из штатного репозитория (внимание: из штатного репозитория ставится node 6, для работы ssl нужен node 8)

```
yum install nodejs -y
```

- Устанавливаете зависимости (или копируете из репозитория ./node_modules/* и файл ./package.json)

- Создаете системную службу (на примере CentOS 7.x/systemd):

  - создаете файл в /etc/systemd/system/iocommander-server.service
  
```
[Unit]
Description=Web and Socket server for iocommander
after=network.target remote-fs.target nss-lookup.target

[Service]
WorkingDirectory=/home/iocommander/
ExecStart=/bin/node /home/iocommander/src-server/iocommander-server.js
ExecStop=kill -9 $(pidof node)

[Install]
WantedBy=multi-user.target

```

  - обновляете список системных демонов
  
```
systemctl daemon-reload
```

  - запускаете демона
  
```
systemctl start iocommander-server
```

  - проверяете остановку демона
  
```
systemctl stop iocommander-server
```

  - проверяете перезапуск демона
  
```
systemctl restart iocommander-server
```

  - проверяете лог демона
  
```
systemctl status iocommander-server -l
```

- Заходите в панель администрирования по адресу 0.0.0.0:8000
