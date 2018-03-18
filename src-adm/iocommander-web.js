/*
		IoCommander v1.0.0
	https://github.com/siarheidudko/iocommander
	(c) 2018 by Siarhei Dudko.
	https://github.com/siarheidudko/iocommander/LICENSE
*/

"use strict"
class AdminIoCommanderPanelAuth extends React.Component{
  
	constructor(props, context){
		super(props, context);
		this.state = {
			login: '',
			password: '',
		}
    }
	
	onChangeHandler(e){
		switch(e.target.name){
			case 'SetParamLogin':
				this.setState({login: e.target.value});
				break;
			case 'SetParamPassword':
				this.setState({password: e.target.value});
				break;
		}
	}
	
	onBtnClickHandler(e){
		if(e.target.id === 'submit'){
			initialiseSocket(this.state.login, this.state.password);
		}
	}
	
	render() {
		var AdminIoCommanderPanelAuth = new Array;
		//поле ввода логина
		AdminIoCommanderPanelAuth.push(<div>Логин: <input name="SetParamLogin" onChange={this.onChangeHandler.bind(this)} value={this.state.login} /></div>);
		//поле ввода пароля
		AdminIoCommanderPanelAuth.push(<div>Пароль: <input type="password" name="SetParamPassword" onChange={this.onChangeHandler.bind(this)} value={this.state.password} /></div>);
		//кнопка входа
		AdminIoCommanderPanelAuth.push(<div><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Войти</button></div>);
		
		return (
			<div className="AdminIoCommanderPanelAuth">
				{AdminIoCommanderPanelAuth}
			</div>
		);
	}
	
}

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
				}
				this.setState({ParamTwo: ''});
				this.setState({ParamThird: ''});
				this.setState({ParamFour: ''});
				this.setState({ParamFive: ''});
				this.setState({ParamSix: ''});
				this.setState({ParamSeven: new Array});
				this.setState({ParamEight: new Array});
				break;
			default:
				break;
		}
	}
	
	onChangeHandler(e){
		var regexpAll = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
		switch(e.target.name){
			case 'SetParamOne':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					this.setState({ParamOne: e.target.value});
				}
				break;
			case 'SetParamTwo':
				this.setState({ParamTwo: e.target.value});
				break;
			case 'SetParamThird':
				var regexp = new RegExp("^.*[^A-z0-9\. \?\/&_:-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execCommand')){
					this.setState({ParamThird: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execCommand')) {
					this.setState({ParamThird: e.target.value.replace(/\\/gi,"/")});
				}
				break;
			case 'SetParamFour':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamFour: e.target.value.replace(/\\/gi,"/")});
				}
				break;
			case 'SetParamFive':
				var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execFile')){
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execFile')) {
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				}
				break;
			case 'SetParamSix':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamSix: e.target.value});
				}
				break;
			case 'SetParamSeven':
				var regexp = new RegExp("^.*[^A-z0-9;-].*$");
				if(!regexp.test(e.target.value)){
					var ParamSeven = e.target.value.split(';');
					this.setState({ParamSeven: ParamSeven});
				}
				break;
			case 'SetParamEight':
				var regexp = new RegExp("^.*[^A-z0-9\._-].*$");
				if(!regexp.test(e.target.value)){
					var ParamEight = this.state.ParamEight.slice();
					if(e.target.checked){
						ParamEight.push(e.target.value);
						this.setState({ParamEight: ParamEight});
					} else {
						ParamEight.splice(ParamEight.indexOf(e.target.value), 1);
						this.setState({ParamEight: ParamEight});
					}
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
						var onSetTask = false;
						if((typeof(this.state.ParamOne) === 'string') && (this.state.ParamOne !== '') && (typeof(this.state.ParamTwo) === 'string') && (this.state.ParamTwo !== '') && (typeof(this.state.ParamSix) === 'string') && (this.state.ParamSix !== '') && (typeof(this.state.ParamSeven) === 'object') && (typeof(this.state.ParamEight) === 'object')){
							switch(this.state.ParamTwo){
								case 'getFileFromWWW':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '') && (typeof(this.state.ParamFour) === 'string') && (this.state.ParamFour !== '') && (typeof(this.state.ParamFive) === 'string') && (this.state.ParamFive !== '')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, extLink:this.state.ParamThird, intLink:this.state.ParamFour, fileName: this.state.ParamFive, exec:'false', complete:'false', answer:'', platform:this.state.ParamSix, dependencies:this.state.ParamSeven}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
										}
									break;
								case 'execFile':
										if((typeof(this.state.ParamThird) === 'string') && (typeof(this.state.ParamFour) === 'string') && (this.state.ParamFour !== '') && (typeof(this.state.ParamFive) === 'string')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, intLink:this.state.ParamThird, fileName: this.state.ParamFour, paramArray:[this.state.ParamFive], complete:'false', answer:'', platform:this.state.ParamSix, dependencies:this.state.ParamSeven}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
										}
									break;
								case 'execCommand':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, execCommand:this.state.ParamThird, platform:this.state.ParamSix, dependencies:this.state.ParamSeven}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
										}
									break;
							}
						} else {
							console.log(datetime() + "Некорректные аргументы!");
						}
						if((onSetTask) && (this.state.ParamEight.length > 0)){
							for(var i=0;i<this.state.ParamEight.length;i++){
								var EmitMessage = new Array(this.state.ParamEight[i], tempTask);
								window.socket.emit('adm_setTask', EmitMessage);
								this.setState({ParamOne: generateUID()});
								this.setState({ParamThird: ''});
								this.setState({ParamFour: ''});
								this.setState({ParamFive: ''});
								this.setState({ParamSix: ''});
								this.setState({ParamSeven: new Array});
								this.setState({ParamEight: new Array});
							}
						} else{
							console.log(datetime() + "Проблема генерации задачи!");
						}
						break;
					case 'adm_setUser':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: ''});
							this.setState({ParamTwo: ''});
							this.setState({ParamThird: ''});
							this.setState({ParamFour: ''});
							this.setState({ParamFive: ''});
							this.setState({ParamSix: ''});
							this.setState({ParamSeven: new Array});
							this.setState({ParamEight: new Array});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
						}
						break;
					case 'adm_setAdmin':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setAdmin', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: ''});
							this.setState({ParamTwo: ''});
							this.setState({ParamThird: ''});
							this.setState({ParamFour: ''});
							this.setState({ParamFive: ''});
							this.setState({ParamSix: ''});
							this.setState({ParamSeven: new Array});
							this.setState({ParamEight: new Array});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
						}
						break;
					case 'adm_delUser':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delUser', [user_name]);
							this.setState({ParamOne: ''});
							this.setState({ParamTwo: ''});
							this.setState({ParamThird: ''});
							this.setState({ParamFour: ''});
							this.setState({ParamFive: ''});
							this.setState({ParamSix: ''});
							this.setState({ParamSeven: new Array});
							this.setState({ParamEight: new Array});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
						}
						break;
					case 'adm_delAdmin':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: ''});
							this.setState({ParamTwo: ''});
							this.setState({ParamThird: ''});
							this.setState({ParamFour: ''});
							this.setState({ParamFive: ''});
							this.setState({ParamSix: ''});
							this.setState({ParamSeven: new Array});
							this.setState({ParamEight: new Array});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
						}
						break;
				}
			} else {
				console.log(datetime() + "Сокет недоступен!");
			}
		}
	}
	
	render() {
		
		var AdminIoCommanderPanelBodyHeader = <center><p><img className="imgCommandType" src="adm_settask.png" alt="Добавить задачу" title="Добавить задачу" name="CommandType" id="adm_setTask" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setTask')?"2":"0"} />
			<img className="imgCommandType" src="./adm_setuser.png" alt="Добавить пользователя" title="Добавить пользователя" name="CommandType" id="adm_setUser" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setUser')?"2":"0"} />
			<img className="imgCommandType" src="./adm_setadmin.png" alt="Добавить администратора" title="Добавить администратора" name="CommandType" id="adm_setAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setAdmin')?"2":"0"} />
			<img className="imgCommandType" src="./adm_deluser.png" alt="Удалить пользователя" title="Удалить пользователя" name="CommandType" id="adm_delUser" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_delUser')?"2":"0"} />
			<img className="imgCommandType" src="./adm_deladmin.png" alt="Удалить администратора" title="Удалить администратора" name="CommandType" id="adm_delAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_delAdmin')?"2":"0"} />
			<img className="imgCommandType" src="./adm_report.png" alt="Отчеты по таскам" title="Отчеты по таскам" name="CommandType" id="adm_TaskReport" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_TaskReport')?"2":"0"} /></p></center>;
		
		var AdminIoCommanderPanelBodyMiddle = new Array;
		switch (this.state.CommandType){
			case 'adm_setTask':
				//поле с uid таска (только чтение)
				AdminIoCommanderPanelBodyMiddle.push(<div>UID: <input name="SetParamOne" value={this.state.ParamOne} readonly /></div>);
				//выпадающий список типов заданий
				var adm_setTaskOption = new Array;
				adm_setTaskOption.push(<option value="">Выберите тип задания</option>);
				adm_setTaskOption.push(<option value="getFileFromWWW" selected={(this.state.ParamTwo === 'getFileFromWWW')?true:false}>Скачать файл в папку</option>);
				adm_setTaskOption.push(<option value="execFile" selected={(this.state.ParamTwo === 'execFile')?true:false}>Запустить локальный скрипт</option>);
				adm_setTaskOption.push(<option value="execCommand" selected={(this.state.ParamTwo === 'execCommand')?true:false}>Выполнить команду</option>);
				var adm_setTask = <p><select size="1" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOption} </select></p>;
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
						adm_setTaskOptionPlatform.push(<option value="all" selected={(this.state.ParamSix === 'all')?true:false}>Любая</option>);
					}
					adm_setTaskOptionPlatform.push(<option value="win32" selected={(this.state.ParamSix === 'win32')?true:false}>Windows</option>);
					adm_setTaskOptionPlatform.push(<option value="linux" selected={(this.state.ParamSix === 'linux')?true:false}>Linux</option>);
					var adm_setTaskOptionPlatformSet = <p><select size="1" name="SetParamSix" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOptionPlatform} </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTaskOptionPlatformSet} </div>);
					//поле ввода зависимостей
					AdminIoCommanderPanelBodyMiddle.push(<div>Зависимости (через ;): <input name="SetParamSeven" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamSeven.join(';')} /></div>);
					//флаг выбора объектов
					var AdminIoCommanderPanelBodyMiddleClients = new Array;
					var div_val = 0;
					for(var keyUser in serverStorage.getState().users){
						AdminIoCommanderPanelBodyMiddleClients.push(<div className={'clientObject' + div_val}>{replacer(keyUser, false)}: <input type="checkbox" name="SetParamEight" onChange={this.onChangeHandler.bind(this)} value={replacer(keyUser, false)} checked={(this.state.ParamEight.indexOf(replacer(keyUser, false)) === -1)?false:true} /></div>);
						if(div_val <=5){
							div_val++;
						} else {
							div_val = 0;
						}
					}
					AdminIoCommanderPanelBodyMiddle.push(<div>Объекты:<br /> {AdminIoCommanderPanelBodyMiddleClients} </div>);
					
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
			case 'adm_TaskReport':
				//отчеты по таскам
				var adm_TaskReportOption = new Array;
				adm_TaskReportOption.push(<option value="">Выберите задачу</option>);
				for(var keyTask in adminpanelStorage.getState().report){
					adm_TaskReportOption.push(<option value={keyTask}>{keyTask}</option>);
				}
				var adm_TaskReport = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_TaskReportOption} + </select></p>;
				var adm_TaskReportResult = new Array;
				if(this.state.ParamOne !== ""){
					var tempStorage = adminpanelStorage.getState().report;
					if(typeof(tempStorage[this.state.ParamOne]) !== 'undefined'){
						var tempObjects = tempStorage[this.state.ParamOne].objects;
						if(typeof(tempObjects) !== 'undefined'){
							
							for(var keyObject in tempObjects){ //reportTableStaus' + tempObjects[keyObject].complete
								var adm_TaskReportResultRow = new Array;
								adm_TaskReportResultRow.push(<div className="reportTableColumnName">{keyObject}</div>);
								adm_TaskReportResultRow.push(<div className="reportTableColumnStatus">{tempObjects[keyObject].complete}</div>);
								adm_TaskReportResultRow.push(<div className="reportTableColumnAnswer">{tempObjects[keyObject].answer}</div>);
								if(typeof(tempObjects[keyObject].datetime) == 'number'){
									var dateEpochToString = new Date(tempObjects[keyObject].datetime);
									adm_TaskReportResultRow.push(<div className="reportTableColumnDate">{dateEpochToString.toString()}</div>);
								} else {
									adm_TaskReportResultRow.push(<div className="reportTableColumnDate">not converted</div>);
								}
								adm_TaskReportResult.push(<div className={'reportTableRow reportTableRow'+tempObjects[keyObject].complete}>{adm_TaskReportResultRow}</div>)
							}
						}
					}
				}
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_TaskReport} <div className="reportTable">{adm_TaskReportResult}</div></div>);
				break;
			default:
				AdminIoCommanderPanelBodyMiddle.push(<div> Неизвестный тип команды! </div>);
				break;
		};
		if (this.state.CommandType !== 'adm_TaskReport'){
			var AdminIoCommanderPanelBodyBottom = <div className="AdminIoCommanderPanelBodyBottom"><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Выполнить</button></div>;
		}
		return (
			<div className="AdminIoCommanderPanelBody">
				{AdminIoCommanderPanelBodyHeader}
				<div className="PanelBodyMargin">
					{AdminIoCommanderPanelBodyMiddle}
					{AdminIoCommanderPanelBodyBottom}
				</div>
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
			auth: false,
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
		adminpanelStorage.subscribe(function(){
			self.setState({auth: adminpanelStorage.getState().auth});
		});
	}
      
	componentWillUnmount() {
	}
      
  	render() {
		return (
			<div className="AdminIoCommanderPanel">
				<AdminIoCommanderPanelHeader />
				{(this.state.auth)?<AdminIoCommanderPanelBody />:<AdminIoCommanderPanelAuth />}
				<AdminIoCommanderPanelBottom data={this.state.OnlineUsers} />
			</div>
		);
	}
};

ReactDOM.render(
	<AdminIoCommanderPanel />,
	document.getElementById('AdminIoCommander')
);