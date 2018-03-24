# IoCommander v1.0.0
#### Приложение для отправки команд удаленным клиентам через socket.io. Функционал написан на серверном javascript и представлен тремя отдельными частями

Стабильная версия всегда в ветке production. Для работы ssl - необходима стабильная версия node 8

Для запуска и клиента и сервера на linux достаточно бинарника из архива node (https://nodejs.org/en/download/), для windows установленной программы nodejs. Для удобства, рекомендую закинуть его в /bin/node с правами x+.
Тестируется на LTS (8.10.0 - текущая).


### Скрипт сервера

- [Установка сервера](https://github.com/siarheidudko/iocommander/blob/master/docs/server/install.md)

- [Техническая документация работы сервера](https://github.com/siarheidudko/iocommander/blob/master/docs/server/techdocs.md)

- Зависимости
  - socket.io
  - http
  - https
  - colors
  - fs
  - cryptojs
  - redux
  - lodash
  - firebase

- Представлен двумя файлами
  - src-server\iocommander-server.js - исполняемый скрипт сервера
  - src-server\iocommander-server.conf - файл конфигурации сервера
  
- Поднимает два сервера:  
  - web-сервер (веб-приложение панели управления, написанное на react + redux + socket.io)
  - socket-сервер (основной сервер приложения)

- Генерирует отчеты по таскам в режиме реального времени

- Генерирует группы пользователей по строке до ".", т.е. при логине users.siarhei - пользователь автоматически попадет в группу users

- Имеет встроенную защиту от взлома (шифрование паролей в SHA256 с солью, собственный ip2ban)

### Скрипт клиента (настройки в файле "src-user\iocommander-usr.conf", запуск "node .\src-user\iocommander-usr.js"), который:

- [Установка клиента](https://github.com/siarheidudko/iocommander/blob/master/docs/client/install.md)

- [Техническая документация работы клиента](https://github.com/siarheidudko/iocommander/blob/master/docs/client/techdocs.md)

- Зависимости
  - socket.io-client
  - colors
  - fs
  - cryptojs
  - redux
  - lodash
  - firebase
  - os
  - download-file
  - child_process
  
- Представлен тремя файлами
  - src-user\iocommander-usr.js - исполняемый скрипт сервера
  - src-user\iocommander-usr.conf - файл конфигурации сервера
  - src-user\storage.db - json-файл базы данных, создается автоматически
  
- Поднимает socket-клиент

- Задание "скачать файл в папку", пример:
```
	{
		uid:'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf', 
		task: {
			nameTask:'getFileFromWWW', 
			extLink:'http://vpn.sergdudko.tk/releases/dwpanel-2.2.0-1.noarch.rpm',	//ссылка для скачки
			intLink:'/test/',	//каталог для записи (для win32 будет записан относительно диска C)
			fileName: '1.rpm',	//имя файла, может отличатся от исходного
			exec:'false', 
			complete:'false',	//флаг, что задание выполнено
			answer:'',	//вывод содержимого консоли по факту выполнения команды (обратная связь)
			dependencies:[],	//зависимости, выполнение команды возможно, только если зависимости выполнены.
			platform:'all',	//тип операционной системы (all, win32 или linux)
			comment:'Тестовое задание',	//комментарий для вывода в отчеты
			datetime:1521528701303,	//время создания задачи	(epoch)
			datetimecompl:1521528701303,	//время получения отчета о выполнении/невыполнении задачи сервером	(epoch)
			timeoncompl:1521528701303,	//время после которого нужно выполнить задачу	(epoch)
			"tryval": 0	//попытка, с которой выполняется задание, если 100 - задание не выполнено
		}
	}
```  

- Задание "Запустить локальный скрипт", пример:
```
	{
		uid:'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf', 
		task: {
			nameTask:'execFile', 
			intLink:'', 	//папка с скриптом
			fileName: 'node',	//имя файла
			paramArray:['--version'],	//параметры запуска
			complete:'false', 
			answer:'', 
			dependencies:['efc0a00f-00b3-489d-be28-b1760be01618'],
			platform:'linux',
			comment:'Тестовое задание',												
			datetime:1521528701303,												
			datetimecompl:1521528701303,									
			timeoncompl:1521528701303,												
			"tryval": 0																
		}
	}
```  

- Задание "Выполнить команду", пример:
```
	{
		uid:'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf', 
		task: {
			nameTask:'execCommand', 
			execCommand:'echo 111',	//команда для выполнения
			platform:'win32',	//тип операционной системы задан жестко, т.е. только win32 или linux
			dependencies:[
				'efc0a00f-00b3-489d-be28-b1760be01618', 
				'f0b11bc4-83d2-45aa-ba4d-b3fc86198cbf'
			],
			comment:'Тестовое задание',												
			datetime:1521528701303,												
			datetimecompl:1521528701303,									
			timeoncompl:1521528701303,												
			"tryval": 0
		}
	}
```  

### Веб-панель администратора

- [Инструкция по работе с панелью администрирования](https://github.com/siarheidudko/iocommander/blob/master/docs/web/manual.md)

- [Техническая документация работы панели администрирования](https://github.com/siarheidudko/iocommander/blob/master/docs/web/techdocs.md)

- Умеет авторизовавыться в сокете
  
- Автоматически получает измененные данные из сокета (два аналогичных серверу хранилища)

- Имеет собственное redux хранилище для функционирования админки.

- Реализовано на react framework

- Отображает онлайн пользователей

- Позволяет удалять/добавлять администраторов и пользователей

- Позволяет создавать задачи пользовател (выбранные пользователи, для удобства реализованы группы пользователей) и передавать их серверу

- Выводит отчеты по выполнению задач клиентами
