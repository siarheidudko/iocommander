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
		};
    }
	
	onChangeHandler(e){
		switch(e.target.name){
			case 'CommandType':
				this.setState({CommandType: e.target.value});
				if(e.target.value === 'adm_setTask'){
					this.setState({ParamOne: generateUID()});
				}
				break;
			case 'SetParamOne':
				this.setState({ParamOne: e.target.value});
				break;
			case 'SetParamTwo':
				this.setState({ParamTwo: e.target.value});
				break;
			default:
				break;
		}
	}
	
	onBtnClickHandler(e){
		console.log(this.state.CommandType);
	}
	
	render() {
		
		var AdminIoCommanderPanelBodyHeader = <p><select size="1" name="CommandType" onChange={this.onChangeHandler.bind(this)}>
				<option disabled>Выберите задачу</option>
				<option selected value="adm_setTask">Добавить задачу</option>
				<option value="adm_setUser">Добавить пользователя</option>
				<option value="adm_setAdmin">Добавить администратора</option>
				<option value="adm_delUser">Удалить пользователя</option>
				<option value="adm_delAdmin">Удалить администратора</option>
			</select></p>;
		
		var AdminIoCommanderPanelBodyMiddle = new Array;
		switch (this.state.CommandType){
			case 'adm_setTask':
				AdminIoCommanderPanelBodyMiddle.push(<div>UID: <input name="SetParamOne" value={this.state.ParamOne} readonly /></div>);
				
				var adm_setTaskOption = new Array;
				adm_setTaskOption.push(<option value="">Выберите тип задания</option>);
				adm_setTaskOption.push(<option value="getFileFromWWW">Скачать файл в папку</option>);
				adm_setTaskOption.push(<option value="execFile">Запустить локальный скрипт</option>);
				adm_setTaskOption.push(<option value="execCommand">Выполнить команду</option>);
				var adm_setTask = <p><select size="1" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)}> + {adm_setTaskOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTask} </div>);
				
				switch(this.state.ParamOne){
					case 'getFileFromWWW':
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						break;
					case 'execFile':
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						break;
					case 'execCommand':
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости: <input name="SetParamThird" onChange={this.onChangeHandler.bind(this)} /></div>);
						break;
				}
				break;
			case 'adm_setUser':
				AdminIoCommanderPanelBodyMiddle.push(<div>Логин: <input name="SetParamOne" onChange={this.onChangeHandler.bind(this)} /></div>);
				AdminIoCommanderPanelBodyMiddle.push(<div>Пароль: <input name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} /></div>);
				break;
			case 'adm_setAdmin':
				AdminIoCommanderPanelBodyMiddle.push(<div>Логин: <input name="SetParamOne" onChange={this.onChangeHandler.bind(this)} /></div>);
				AdminIoCommanderPanelBodyMiddle.push(<div>Пароль: <input name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} /></div>);
				break;
			case 'adm_delUser':
				var adm_delUserOption = new Array;
				adm_delUserOption.push(<option value="">Выберите пользователя</option>);
				for(var keyUser in serverStorage.getState().users){
					adm_delUserOption.push(<option value={keyUser}>{replacer(keyUser, false)}</option>);
				}
				var adm_delUser = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delUserOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delUser} </div>);
				break;
			case 'adm_delAdmin':
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
		};
    }
      
	componentDidMount() {
		var self = this;
		serverStorage.subscribe(function(){
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