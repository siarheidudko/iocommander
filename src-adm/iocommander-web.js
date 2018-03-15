/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/

"use strict"
class AdminIoCommanderPanelHeader extends React.Component{
  
	constructor(props, context){
		super(props, context);
    }
	
	render() {
		return (
			<div className="AdminIoCommanderPanelHeader">
				<h2> Администрирование IoCommander v1.0.0 </h2>
			</div>
		);
	}
	
}

class AdminIoCommanderPanelBody extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			CommandType: 'adm_setTask',
			ParamOne: generateUID(),
			ParamTwo: '',
			ParamThird: '',
			ParamFour: '',
			ParamFive: '',
			ParamSix: '',
			ParamSeven: new Array,
			ParamEight: new Array,
		};
    }
	
	onClickHandler(e){
		switch(e.target.name){
			case 'CommandType':
				this.setState({CommandType: e.target.id});
				if(e.target.id === 'adm_setTask'){
					this.setState({ParamOne: generateUID()});
				} else {
					this.setState({ParamOne: ''});
					this.setState({ParamTwo: ''});
					this.setState({ParamThird: ''});
					this.setState({ParamFour: ''});
					this.setState({ParamFive: ''});
					this.setState({ParamSix: ''});
					this.setState({ParamSeven: new Array});
					this.setState({ParamEight: new Array});
				}
				break;
			default:
				break;
		}
	}
	
	onChangeHandler(e){
		switch(e.target.name){
			case 'SetParamOne':
				this.setState({ParamOne: e.target.value});
				break;
			case 'SetParamTwo':
				this.setState({ParamTwo: e.target.value});
				break;
			case 'SetParamThird':
				this.setState({ParamThird: e.target.value});
				break;
			case 'SetParamFour':
				this.setState({ParamFour: e.target.value});
				break;
			case 'SetParamFive':
				this.setState({ParamFive: e.target.value});
				break;
			case 'SetParamSix':
				this.setState({ParamSix: e.target.value});
				break;
			case 'SetParamSeven':
				this.setState({ParamSeven: this.state.ParamSeven.push(e.target.value)});
				break;
			case 'SetParamEight':
				var ParamEight = this.state.ParamEight.slice();
				if(e.target.checked){
					ParamEight.push(e.target.value);
					this.setState({ParamEight: ParamEight});
				} else {
					ParamEight.splice(ParamEight.indexOf(e.target.value), 1);
					this.setState({ParamEight: ParamEight});
				}
				break;
			default:
				break;
		}
	}
	
	onBtnClickHandler(e){
		if(e.target.id === 'submit'){
			if(typeof(window.socket) !== 'undefined'){
				switch(this.state.CommandType){
					case 'adm_setTask':
						console.log(this.state.ParamEight);
						break;
					case 'adm_setUser':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
						break;
					case 'adm_setAdmin':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						window.socket.emit('adm_setAdmin', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
						break;
					case 'adm_delUser':
						var user_name = this.state.ParamOne;
						window.socket.emit('adm_delUser', [user_name]);
						break;
					case 'adm_delAdmin':
						var user_name = this.state.ParamOne;
						window.socket.emit('adm_delAdmin', [user_name]);
						break;
				}
			}
		}
	}
	
	render() {
		
		var AdminIoCommanderPanelBodyHeader = <center><p><img src="adm_settask.jpg" alt="Добавить задачу" name="CommandType" id="adm_setTask" onClick={this.onClickHandler.bind(this)} />
			<img src="./adm_setuser.jpg" alt="Добавить пользователя" name="CommandType" id="adm_setUser" onClick={this.onClickHandler.bind(this)} />
			<img src="./adm_setadmin.jpg" alt="Добавить администратора" name="CommandType" id="adm_setAdmin" onClick={this.onClickHandler.bind(this)} />
			<img src="./adm_deluser.jpg" alt="Удалить пользователя" name="CommandType" id="adm_delUser" onClick={this.onClickHandler.bind(this)} />
			<img src="./adm_deladmin.jpg" alt="Удалить администратора" name="CommandType" id="adm_delAdmin" onClick={this.onClickHandler.bind(this)} /></p></center>;
		
		var AdminIoCommanderPanelBodyMiddle = new Array;
		switch (this.state.CommandType){
			case 'adm_setTask':
				//поле с uid таска (только чтение)
				AdminIoCommanderPanelBodyMiddle.push(<div>UID: <input name="SetParamOne" value={this.state.ParamOne} readonly /></div>);
				//выпадающий список типов заданий
				var adm_setTaskOption = new Array;
				adm_setTaskOption.push(<option value="">Выберите тип задания</option>);
				adm_setTaskOption.push(<option value="getFileFromWWW">Скачать файл в папку</option>);
				adm_setTaskOption.push(<option value="execFile">Запустить локальный скрипт</option>);
				adm_setTaskOption.push(<option value="execCommand">Выполнить команду</option>);
				var adm_setTask = <p><select size="1" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)}> + {adm_setTaskOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTask} </div>);
				switch(this.state.ParamTwo){
					case 'getFileFromWWW':
						//поле ввода ссылки для скачки
						AdminIoCommanderPanelBodyMiddle.push(<div>Ссылка для скачки: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamThird} /></div>);
						//поле ввода локального пути для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div>Локальный путь: <input name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода имени файла для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div>Имя файла: <input name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						break;
					case 'execFile':
						//поле ввода пути к скрипту
						AdminIoCommanderPanelBodyMiddle.push(<div>Путь к скрипту: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamThird} /></div>);
						//поле ввода имени скрипта
						AdminIoCommanderPanelBodyMiddle.push(<div>Имя скрипта: <input name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода параметров запуска
						AdminIoCommanderPanelBodyMiddle.push(<div>Параметры запуска: <input name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						break;
					case 'execCommand':
						//поле ввода команды запуска
						AdminIoCommanderPanelBodyMiddle.push(<div>Команда: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamThird} /></div>);
						break;
				}
				if(this.state.ParamTwo !== ''){
					//выпадающий список выбора платформы
					var adm_setTaskOptionPlatform = new Array;
					adm_setTaskOptionPlatform.push(<option value="">Выберите платформу</option>);
					if(this.state.ParamTwo !== 'execCommand'){
						adm_setTaskOptionPlatform.push(<option value="all">Любая</option>);
					}
					adm_setTaskOptionPlatform.push(<option value="win32">Windows</option>);
					adm_setTaskOptionPlatform.push(<option value="linux">Linux</option>);
					var adm_setTaskOptionPlatformSet = <p><select size="1" name="SetParamSix" onChange={this.onChangeHandler.bind(this)}> + {adm_setTaskOptionPlatform} + </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTaskOptionPlatformSet} </div>);
					//поле ввода зависимостей
					AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamSeven" onChange={this.onChangeHandler.bind(this)} /></div>);
					//флаг выбора объектов
					var AdminIoCommanderPanelBodyMiddleClients = new Array;
					for(var keyUser in serverStorage.getState().users){
						AdminIoCommanderPanelBodyMiddleClients.push(<div>{replacer(keyUser, false)}: <input type="checkbox" name="SetParamEight" onChange={this.onChangeHandler.bind(this)} value={replacer(keyUser, false)} /></div>);
					}
					AdminIoCommanderPanelBodyMiddle.push(<div>Объекты: {AdminIoCommanderPanelBodyMiddleClients}</div>);
					
				}
				break;
			case 'adm_setUser':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div>Логин: <input name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div>Пароль: <input name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_setAdmin':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div>Логин: <input name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div>Пароль: <input name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_delUser':
				//выпадающий список пользователей
				var adm_delUserOption = new Array;
				adm_delUserOption.push(<option value="">Выберите пользователя</option>);
				for(var keyUser in serverStorage.getState().users){
					adm_delUserOption.push(<option value={keyUser}>{replacer(keyUser, false)}</option>);
				}
				var adm_delUser = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delUserOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delUser} </div>);
				break;
			case 'adm_delAdmin':
				//выпадающий список администраторов
				var adm_delAdminOption = new Array;
				adm_delAdminOption.push(<option value="">Выберите пользователя</option>);
				for(var keyAdmin in serverStorage.getState().admins){
					adm_delAdminOption.push(<option value={keyAdmin}>{replacer(keyAdmin, false)}</option>);
				}
				var adm_delAdmin = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delAdminOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delAdmin} </div>);
				break;
			default:
				AdminIoCommanderPanelBodyMiddle.push(<div> Неизвестный тип команды! </div>);
				break;
		};
		
		var AdminIoCommanderPanelBodyBottom = <button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Выполнить</button>;
		
		return (
			<div className="AdminIoCommanderPanelBody">
				{AdminIoCommanderPanelBodyHeader}
				{AdminIoCommanderPanelBodyMiddle}
				{AdminIoCommanderPanelBodyBottom}
			</div>
		);
	}
	
}

class AdminIoCommanderPanelBottom extends React.Component{
  
	constructor(props, context){
		super(props, context);
    }
	
	componentDidMount() {
		var showingTooltip;
		this.showingTooltip = showingTooltip;
	}
	
	MouseOver(e) {
		var target = e.target;
		if(target.getAttribute('data-tooltip') !== null){
			var tooltip = target.getAttribute('data-tooltip').toString().replace(/\,/gi,"<br>");
			if (!tooltip) return;

			var tooltipElem = document.createElement('div');
			tooltipElem.className = 'tooltip';
			tooltipElem.innerHTML = tooltip;
			document.body.appendChild(tooltipElem);

			var coords = target.getBoundingClientRect();

			var left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
			if (left < 0) left = 0; // не вылезать за левую границу окна

			var top = coords.top - tooltipElem.offsetHeight - 5;
			if (top < 0) { // не вылезать за верхнюю границу окна
				top = coords.top + target.offsetHeight + 5;
			}

			tooltipElem.style.left = left + 'px';
			tooltipElem.style.top = top + 'px';

			this.showingTooltip = tooltipElem;
		}
	}
	
	MouseOut(e) {
		if (this.showingTooltip) {
			document.body.removeChild(this.showingTooltip);
			this.showingTooltip = null;
		}
	}
	
	render() {
		var AdminIoCommanderPanelBottomUsersOnline = new Array,
		AdminIoCommanderPanelBottomUsersOffline = new Array;
		for(var OnlineUser in this.props.data) {
			AdminIoCommanderPanelBottomUsersOnline.push(replacer(OnlineUser, false));
		}
		for(var OfflineUser in serverStorage.getState().users) {
			if(AdminIoCommanderPanelBottomUsersOnline.indexOf(replacer(OfflineUser, false)) === -1){
				AdminIoCommanderPanelBottomUsersOffline.push(replacer(OfflineUser, false));
			}
		}
		for(var OfflineUser in serverStorage.getState().admins) {
			if(AdminIoCommanderPanelBottomUsersOnline.indexOf(replacer(OfflineUser, false)) === -1){
				AdminIoCommanderPanelBottomUsersOffline.push(replacer(OfflineUser, false));
			}
		}
		return (
			<div className="AdminIoCommanderPanelBottom">
				<div className="AdminIoCommanderPanelBottomUsersOnline" data-tooltip={AdminIoCommanderPanelBottomUsersOnline} onMouseOver={this.MouseOver.bind(this)} onMouseOut={this.MouseOut.bind(this)}>
					<div>{'Online: ' + AdminIoCommanderPanelBottomUsersOnline.length}</div>
				</div>
				<div className="AdminIoCommanderPanelBottomUsersOffline" data-tooltip={AdminIoCommanderPanelBottomUsersOffline} onMouseOver={this.MouseOver.bind(this)} onMouseOut={this.MouseOut.bind(this)}>
					<div>{'Offline: ' + AdminIoCommanderPanelBottomUsersOffline.length}</div>
				</div>
			</div>
		);
	}
	
}

class AdminIoCommanderPanel extends React.Component{
  
   constructor(props, context){
		super(props, context);
		this.state = {
			OnlineUsers: {},
			clientUsers: {},
			adminUsers: {},
		};
    }
      
	componentDidMount() {
		var self = this;
		serverStorage.subscribe(function(){
			self.setState({clientUsers: serverStorage.getState().users});
			self.setState({adminUsers: serverStorage.getState().admins});
		});
		connectionStorage.subscribe(function(){
			self.setState({OnlineUsers: connectionStorage.getState().users});
		});
	}
      
	componentWillUnmount() {
	}
      
  	render() {
		return (
			<div className="AdminIoCommanderPanel">
				<AdminIoCommanderPanelHeader />
				<AdminIoCommanderPanelBody />
				<AdminIoCommanderPanelBottom data={this.state.OnlineUsers} />
			</div>
		);
	}
};

ReactDOM.render(
	<AdminIoCommanderPanel />,
	document.getElementById('AdminIoCommander')
);