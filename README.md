﻿# IoCommander v1.0.0
###### Приложение для работы с shell(linux)/cmd(windows) удаленных клиентов через socket.io. 
###### Идея приложения направлена на одновременное управление большим количеством клиентов. Т.е. за основу взята именно массовая отправка команд, а не работа с одним клиентом. 
###### Поддерживается скачка файла клиентом по ссылке в указанную папку, отправка команд в shell/cmd, запуск скрипта на удаленном клиенте, передача файла удаленному клиенту (через http/https). Реализована поддержка обратной связи. При ошибках клиент попытается выполнить команду повторно. 
###### Вся работа идет непосредственно через сокет(доступен websocket, polling), клиенту не нужен выделенный ip, vpn и т.д. Можно настроить порт, чтобы обойти ограничения практически любого firewall или nat (исключая ограничение доступа к веб-сайту в принципе).
###### Приложение писалось максимально стабильным, т.к. у пользователей не было возможности перезапускать службу клиента, а ПК мог не перезагружаться месяцами.
###### Приложение писалось одновременно под linux и windows.
###### Серверная часть также стремиться быть максимально автономной, потому не подразумевает хранение больших объемов информации. Чтобы обойти разрастание базы данных был реализован сборщик мусора, уничтожающий не актуальные данные.
###### Т.к. сервер торчит в интернет, для авторизации и работы используются только хэши паролей с достаточной степенью шифрования, чтобы не быть определенными по радужным картам. Также был реализован собственный ip2ban для защиты от брутфорса. Для защиты от DDOS сервер сразу уничтожает не авторизованные сокеты.
###### Функционал написан полностью на javascript (на клиенте и сервере необходим nodejs) и представлен тремя отдельными частями.

Стабильная версия всегда в ветке production. Для работы ssl - необходима стабильная версия node 8

Для запуска и клиента и сервера на linux достаточно бинарника из архива node (https://nodejs.org/en/download/), для windows соответственно node.exe из аналогичного архива под windows. Для удобства, можете закинуть его в /bin/node с правами x+ (linux) или C:\Windows\System32\ (windows).
Тестируется на LTS (8.10.0 - текущая).
Также необходимо установить зависимости с помощью "npm install имя_зависимости --save" или забрать из репозитория каталог ./node_modules и файл ./package.json.
При этом пути должны сохраняться, т.е. для установки клиента в каталог iocommander/ путь для зависимостей iocommander/node_modules/ путь для скрипта iocommander/src-user/ (см.структуру репозитория).


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
  - multiparty

- Представлен двумя файлами
  - src-server\iocommander-server.js - исполняемый скрипт сервера
  - src-server\iocommander-server.conf - файл конфигурации сервера
  
- Поднимает три сервера:  
  - web-сервер (веб-приложение панели управления, написанное на react + redux + socket.io)
  - socket-сервер (основной сервер приложения)
  - file-сервер (http/https сервер, с Basic авторизацией подключенной к основному стеку ip2ban, распределением ролей)

- Генерирует отчеты по таскам в режиме реального времени

- Генерирует группы пользователей по строке до ".", т.е. при логине users.siarhei - пользователь автоматически попадет в группу users

- Имеет встроенную защиту от взлома (шифрование паролей в SHA256 с солью, собственный ip2ban)

### Скрипт клиента

- [Установка клиента](https://github.com/siarheidudko/iocommander/blob/master/docs/client/install.md)

- [Техническая документация работы клиента](https://github.com/siarheidudko/iocommander/blob/master/docs/client/techdocs.md)

- Зависимости
  - socket.io-client
  - colors
  - fs
  - cryptojs
  - redux
  - lodash
  - os
  - http
  - https
  - url
  - mkdir
  - child_process
  
- Представлен тремя файлами
  - src-user\iocommander-usr.js - исполняемый скрипт сервера
  - src-user\iocommander-usr.conf - файл конфигурации сервера
  - src-user\storage.db - json-файл базы данных, создается автоматически
  
- Поднимает socket-клиент, с автоматическим переподключением при разъединении

- Выполняет задания (базовые)
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
				execCommand:'ps axu|grep node',	//команда для выполнения
				platform:'win32',
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

- Позволяет создавать задачи клиентам (выбранные пользователи, для удобства реализованы группы пользователей) и передавать их серверу

- Выводит отчеты по выполнению задач клиентами

- Реализованные задачи
  - Скачать файл по ссылке в указанную папку
  - Передать файл в указанную папку (фактически файл заливается на файловый сервер с авторизацией, а клиенту ставится задача скачать файл)
  - Выполнить локальный скрипт (в случае линукс предварительно выдаются права 777)
  - Выполнить команду в cmd/shell
