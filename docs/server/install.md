# IoCommander v1.0.0 - Установка сервера

# Создание проекта firebase

- Создаете новый проект по адресу https://console.firebase.google.com



# Настройка проекта

- Копируете файлы проекта, например в папку /home/iocommander/*

- Создаете/редактируете файл настроек ./src-server/iocommander-server.conf

```
{
"port": "444",
"webport": "8000",
"firebase_user": "test@test.com",
"firebase_pass": "testtesttest",
"firebase_config": {
	"apiKey": "AIzaSyBuNtMUJhs8Ifvxe_QxRJiJkSi03oYstJY",
	"authDomain": "test-612c2.firebaseapp.com",
	"databaseURL": "https://test-612c2.firebaseio.com",
	"storageBucket": "test-612c2.appspot.com"
	}
}
```

  - port - порт сокет-сервера
  - webport - порт панели администрирования
  - firebase_user - пользователь, которого мы создали в firebase
  - firebase_pass - пароль пользователя в firebase
  - apiKey - ключ api для веб-приложения
  - в трех ссылках (authDomain, databaseURL, storageBucket) заменить test-612c2 на ваш идентификатор проекта

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
