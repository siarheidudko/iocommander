# IoCommander v1.0.0 - Установка сервера

## Создание проекта firebase

- Создаете новый проект по адресу https://console.firebase.google.com

![Screenshot_1](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_1.png)

- Вводите название проекта и страну

![Screenshot_2](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_2.png)

- Выбираете Разработка/Авторизация

![Screenshot_3](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_3.png)

- Выбираете способы входа и включаете вход по адресу электронной почты и паролю

![Screenshot_4](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_4.png)

- Выбираете пользователи и создаете нового

![Screenshot_5](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_5.png)

- Выбираете Базы данных/База данных реального времени

![Screenshot_6](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_6.png)

- Выбираете правила и задаете права на чтение/запись только для созданного выше пользователя:

```
{
	"rules": {
		".read": "(auth.email == 'admin@sergdudko.tk')",
		".write": "(auth.email == 'admin@sergdudko.tk')"
	}
}
```

![Screenshot_7](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_7.png)

- Заходите в настройки/настройки проекта

![Screenshot_8](https://github.com/siarheidudko/iocommander/raw/master/docs/server/img/Screenshot_8.png)

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

## Настройка проекта

- Копируете файлы проекта, например в папку /home/iocommander/*

  - ./src-server/* - файлы сервера
  - ./src-adm/* - панель администрирования

- Создаете/редактируете файл настроек ./src-server/iocommander-server.conf

```
{
"port": "444",
"webport": "8000",
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
"sslca":"/etc/webmin/letsencrypt-ca.pem"
}
```

  - port - порт сокет-сервера
  - webport - порт панели администрирования
  - firebase_user - пользователь, которого мы создали в firebase
  - firebase_pass - пароль пользователя в firebase
  - apiKey - ключ api для веб-приложения
  - в трех ссылках (authDomain, databaseURL, storageBucket) заменить test-612c2 на ваш идентификатор проекта
  - sslkey, sslcrt, sslca - пути к сертификатам и ключу. Если хоть один параметр пуст, то сервер будет http/ws. Если заполнены, то сервер https/wss.

- Устанавливаете nodejs, например в CentOS 7.x он устанавливается из штатного репозитория

```
yum install nodejs -y
```

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
