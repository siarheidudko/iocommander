/**
 *		IoCommander v1.0.0
 *	https://github.com/siarheidudko/iocommander
 *	(c) 2018 by Siarhei Dudko.
 *	https://github.com/siarheidudko/iocommander/LICENSE
 */

"use strict"
class AdminIoCommanderPanelPopup extends React.PureComponent{
  
   constructor(props, context) {
      super(props, context);
      this.state = {
        PopupText: '',
      };
      this.onDivClickHandler = this.onDivClickHandler.bind(this);
    }
      
	componentDidMount() {
		var self = this;
		adminpanelStorage.subscribe(function(){
			self.setState({PopupText: adminpanelStorage.getState().popuptext});
			if(adminpanelStorage.getState().popuptext !== ''){
				setTimeout(function(){adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:''}});}, 2000);
			}
		});
	}
      
  	onDivClickHandler(e) {
		this.setState({PopupText: ''});
	}
      
  	render() {
      return (
        <div className={(this.state.PopupText == "")?"popup unshow":"popup show"} onClick={this.onDivClickHandler}>
  			<span className="popuptext" id="myPopup">{this.state.PopupText}</span>
        </div>
      );
	}
};

class AdminIoCommanderPanelAuth extends React.PureComponent{
  
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
		var AdminIoCommanderPanelAuthForm = new Array;
		//поле ввода логина
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter">Логин: <input type="text" name="SetParamLogin" autocomplete="username" onChange={this.onChangeHandler.bind(this)} value={this.state.login} /></div>);
		//поле ввода пароля
		AdminIoCommanderPanelAuthForm.push(<div className="inputFieldCenter">Пароль: <input type="password" name="SetParamPassword" autocomplete="current-password" onChange={this.onChangeHandler.bind(this)} value={this.state.password} /></div>);
		AdminIoCommanderPanelAuth.push(<form>{AdminIoCommanderPanelAuthForm}</form>);
		//кнопка входа
		AdminIoCommanderPanelAuth.push(<div className="inputFieldCenter"><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Войти</button></div>);
		
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
				<h2> Администрирование IoCommander v{connectionStorage.getState().version} </h2>
				<head><title>Администрирование IoCommander {connectionStorage.getState().version}</title></head>
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
			ParamTen: '',
			ParamEleven: '',
			ParamEleven: false,
		};
    }
	
	onClickHandler(e){
		switch(e.target.name){
			case 'CommandType':
				if(e.target.id === 'adm_setTask'){
					this.setState({CommandType: e.target.id,ParamOne: generateUID(),ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				} else {
					this.setState({CommandType: e.target.id,ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				}
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
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamTwo':
				if(this.state.CommandType === 'adm_setTask'){
					this.setState({ParamOne: generateUID(),ParamTwo: e.target.value,ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
				} else {
					this.setState({ParamTwo: e.target.value});
				}
				break;
			case 'SetParamThird':
				var regexp = new RegExp("^.*[^A-z0-9\. \"\|\(\)\[\^\$\*\+\?\/&_:!<>@-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execCommand')){
					this.setState({ParamThird: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execCommand')) {
					this.setState({ParamThird: e.target.value});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamFour':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamFour: e.target.value.replace(/\\/gi,"/")});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamFive':
				var regexp = new RegExp("^.*[^A-z0-9\.\?\/&_:-].*$");
				if((!regexpAll.test(e.target.value)) && (this.state.ParamTwo !== 'execFile')){
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				} else if ((!regexp.test(e.target.value)) && (this.state.ParamTwo === 'execFile')) {
					this.setState({ParamFive: e.target.value.replace(/\\/gi,"/")});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamSix':
				if(!regexpAll.test(e.target.value)){
					this.setState({ParamSix: e.target.value});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamSeven':
				var regexp = new RegExp("^.*[^A-z0-9;-].*$");
				if(!regexp.test(e.target.value)){
					var ParamSeven = e.target.value.split(';');
					this.setState({ParamSeven: ParamSeven});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
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
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamNine':
				var regexp = new RegExp("^.*[^A-z0-9А-я ].*$");
				if(!regexp.test(e.target.value)){
					this.setState({ParamNine: e.target.value});
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamTen':
				var regexp = new RegExp("^.*[^0-9T:-].*$");
				if(!regexp.test(e.target.value)){
					//2018-03-19T18:37:00
					switch(e.target.value.length){
						case 4:
							this.setState({ParamTen: e.target.value + '-'});
							break;
						case 7:
							this.setState({ParamTen: e.target.value + '-'});
							break;
						case 10:
							this.setState({ParamTen: e.target.value + 'T'});
							break;
						case 13:
							this.setState({ParamTen: e.target.value + ':'});
							break;
						case 16:
							this.setState({ParamTen: e.target.value + ':'});
							break;
						default:
							if(e.target.value.length < 20){
								this.setState({ParamTen: e.target.value});
							}
							break;
					}
				} else {
					adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:'Некорректный символ!'}});
				}
				break;
			case 'SetParamEleven':
				if(e.target.value !== ""){
					var tempArr = _.clone(connectionStorage.getState().groups[e.target.value]);
					var tempNewArr = _.clone(this.state.ParamEight);
					for(var i =0; i< tempArr.length;i++){
						if(tempNewArr.indexOf(tempArr[i]) === -1){
							tempNewArr.push(tempArr[i]);
						}
					}
					this.setState({ParamEight: tempNewArr,ParamEleven: e.target.value});
				} else {
					var tempArr = _.clone(connectionStorage.getState().groups[this.state.ParamEleven]);
					var tempNewArr = _.clone(this.state.ParamEight);
					for(var i =0; i< tempArr.length;i++){
						if(tempNewArr.indexOf(tempArr[i]) !== -1){
							tempNewArr.splice(tempNewArr.indexOf(tempArr[i]), 1);
						}
					}
					this.setState({ParamEight: tempNewArr,ParamEleven: e.target.value});
				}
				break;
			case 'SetParamTwelve':
				this.setState({ParamTwelve: e.target.checked});
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
							var timeOnCompl;
							try {
								timeOnCompl = new Date(this.state.ParamTen);
							} catch(e){
								timeOnCompl = new Date(0);
							}
							switch(this.state.ParamTwo){
								case 'getFileFromWWW':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '') && (typeof(this.state.ParamFive) === 'string') && (this.state.ParamFive !== '')){
											if((typeof(this.state.ParamFour) !== 'string') || (this.state.ParamFour === '')){
												var intLinkReal = '/tmp/iocom/';
											} else {
												var intLinkReal = this.state.ParamFour;
											}
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, extLink:this.state.ParamThird, intLink:intLinkReal, fileName: this.state.ParamFive, exec:this.state.ParamTwelve.toString(), platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
											adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
										}
									break;
								case 'execFile':
										if((typeof(this.state.ParamThird) === 'string') && (typeof(this.state.ParamFour) === 'string') && (this.state.ParamFour !== '') && (typeof(this.state.ParamFive) === 'string')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, intLink:this.state.ParamThird, fileName: this.state.ParamFour, paramArray:this.state.ParamFive.split(" "), platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
											adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
										}
									break;
								case 'execCommand':
										if((typeof(this.state.ParamThird) === 'string') && (this.state.ParamThird !== '')){
											var tempTask = {uid:this.state.ParamOne, task: {nameTask:this.state.ParamTwo, execCommand:this.state.ParamThird, platform:this.state.ParamSix, dependencies:this.state.ParamSeven, comment:this.state.ParamNine, timeoncompl:timeOnCompl.getTime()}};
											onSetTask = true;
										} else {
											console.log(datetime() + "Некорректные аргументы!");
											adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
										}
									break;
								case 'getFileFromFileserver':
										if((typeof(this.refs.FileUploadToServer.files) === 'object') && (this.refs.FileUploadToServer.files.length === 1)){ //длинна массива файлов =1, если выбран один файл
											if((typeof(this.state.ParamFour) !== 'string') || (this.state.ParamFour === '')){
												var intLinkReal = '/tmp/iocom/';
											} else {
												var intLinkReal = this.state.ParamFour;
											}
											SendFileToInternalFS(this.refs.FileUploadToServer.files, this.state.ParamOne, intLinkReal, this.state.ParamSix, this.state.ParamSeven, this.state.ParamNine, timeOnCompl, this.state.ParamEight, this.state.ParamTwelve.toString());
										} else {
											console.log(datetime() + "Некорректные аргументы!");
											adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});	
										}
										onSetTask = true; //чистим поля
									break;
							}
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						if((onSetTask) && (this.state.ParamEight.length > 0)){
							if(this.state.ParamTwo !== 'getFileFromFileserver'){
								for(var i=0;i<this.state.ParamEight.length;i++){
									var EmitMessage = new Array(this.state.ParamEight[i], tempTask);
									window.socket.emit('adm_setTask', EmitMessage);
								}
							}
							this.setState({ParamOne: generateUID(),ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else{
							console.log(datetime() + "Проблема генерации задачи!");
							//adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Проблема генерации задачи!"}});
						}
						break;
					case 'adm_setUser':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setUser', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
					case 'adm_setAdmin':
						var user_name = this.state.ParamOne;
						var user_pass = this.state.ParamTwo;
						if((typeof(user_name) === 'string') && (user_name !== '') && (typeof(user_pass) === 'string') && (user_pass !== '')){
							window.socket.emit('adm_setAdmin', [user_name, CryptoJS.SHA256(user_name + user_pass + 'icommander').toString()]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
					case 'adm_delUser':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delUser', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
					case 'adm_delAdmin':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
					case 'adm_TaskReport':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
					case 'adm_TaskOnline':
						var user_name = this.state.ParamOne;
						if((typeof(user_name) === 'string') && (user_name !== '')){
							window.socket.emit('adm_delAdmin', [user_name]);
							this.setState({ParamOne: '',ParamTwo: '',ParamThird: '',ParamFour: '',ParamFive: '',ParamSix: '',ParamSeven: new Array,ParamEight: new Array,ParamNine: '',ParamTen: '',ParamEleven: '',ParamTwelve: false});
						} else {
							console.log(datetime() + "Некорректные аргументы!");
							adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Некорректные аргументы!"}});
						}
						break;
				}
			} else {
				console.log(datetime() + "Сокет недоступен!");
				adminpanelStorage.dispatch({type:'MSG_POPUP', payload: {popuptext:"Сокет недоступен!"}});
			}
		}
	}
	
	render() {
		
		var AdminIoCommanderPanelBodyHeader = <center><p><img className="imgCommandType" src="./img/adm_settask.png" alt="Добавить задачу" title="Добавить задачу" name="CommandType" id="adm_setTask" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setTask')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_setuser.png" alt="Добавить пользователя" title="Добавить пользователя" name="CommandType" id="adm_setUser" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setUser')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_setadmin.png" alt="Добавить администратора" title="Добавить администратора" name="CommandType" id="adm_setAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_setAdmin')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_deluser.png" alt="Удалить пользователя" title="Удалить пользователя" name="CommandType" id="adm_delUser" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_delUser')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_deladmin.png" alt="Удалить администратора" title="Удалить администратора" name="CommandType" id="adm_delAdmin" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_delAdmin')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_report.png" alt="Отчеты по таскам" title="Отчеты по таскам" name="CommandType" id="adm_TaskReport" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_TaskReport')?"2":"0"} />
			<img className="imgCommandType" src="./img/adm_online.png" alt="Текущие соединения" title="Текущие соединения" name="CommandType" id="adm_TaskOnline" onClick={this.onClickHandler.bind(this)} border={(this.state.CommandType === 'adm_TaskOnline')?"2":"0"} /></p></center>;
		
		var AdminIoCommanderPanelBodyMiddle = new Array;
		switch (this.state.CommandType){
			case 'adm_setTask':
				//поле с uid таска (только чтение)
				AdminIoCommanderPanelBodyMiddle.push(<div>UID: {this.state.ParamOne}</div>);
				//выпадающий список типов заданий
				var adm_setTaskOption = new Array;
				adm_setTaskOption.push(<option value="">Выберите тип задания</option>);
				adm_setTaskOption.push(<option value="getFileFromWWW" selected={(this.state.ParamTwo === 'getFileFromWWW')?true:false}>Скачать файл по ссылке</option>);
				adm_setTaskOption.push(<option value="getFileFromFileserver" selected={(this.state.ParamTwo === 'getFileFromFileserver')?true:false}>Передать файл</option>);
				adm_setTaskOption.push(<option value="execFile" selected={(this.state.ParamTwo === 'execFile')?true:false}>Запустить локальный скрипт</option>);
				adm_setTaskOption.push(<option value="execCommand" selected={(this.state.ParamTwo === 'execCommand')?true:false}>Выполнить команду</option>);
				var adm_setTask = <p><select size="1" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOption} </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTask} </div>);
				if(this.state.ParamTwo !== ''){
					//Комментарий к таску
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Комментарий (для поиска): <input type="text" name="SetParamNine" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamNine} /></div>);
					//Выполнить после
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Выполнить после (2018-03-19T18:37:00): <input type="text" name="SetParamTen" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTen} /></div>);
					
				}
				switch(this.state.ParamTwo){
					case 'getFileFromWWW':
						//поле ввода ссылки для скачки
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Ссылка для скачки: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						//поле ввода локального пути для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Локальный путь: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода имени файла для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Имя файла: <input type="text" name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						//запустить ли переданный файл (используются переменные окружения)
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Запустить: <input type="checkbox" name="SetParamTwelve" onChange={this.onChangeHandler.bind(this)} checked={this.state.ParamTwelve} /></div>);
						break;
					case 'execFile':
						//поле ввода пути к скрипту
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Путь к скрипту: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						//поле ввода имени скрипта
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Имя скрипта: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//поле ввода параметров запуска
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Параметры запуска: <input type="text" name="SetParamFive" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFive} /></div>);
						break;
					case 'execCommand':
						//поле ввода команды запуска
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Команда: <input type="text" name="SetParamThird" onChange={this.onChangeHandler.bind(this)} value={(typeof(this.state.ParamThird) === 'string')?this.state.ParamThird:null} /></div>);
						break;
					case 'getFileFromFileserver':
						//поле выбора файла для передачи
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Файл: <input type="file" ref="FileUploadToServer" /></div>);
						//поле ввода локального пути для сохранения
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Локальный путь: <input type="text" name="SetParamFour" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamFour} /></div>);
						//запустить ли переданный файл (используются переменные окружения)
						AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Запустить: <input type="checkbox" name="SetParamTwelve" onChange={this.onChangeHandler.bind(this)} checked={this.state.ParamTwelve} /></div>);
						break;
				}
				if(this.state.ParamTwo !== ''){
					//выпадающий список выбора платформы
					var adm_setTaskOptionPlatform = new Array;
					adm_setTaskOptionPlatform.push(<option value="">Выберите платформу</option>);
					adm_setTaskOptionPlatform.push(<option value="all" selected={(this.state.ParamSix === 'all')?true:false}>Любая</option>);
					adm_setTaskOptionPlatform.push(<option value="win32" selected={(this.state.ParamSix === 'win32')?true:false}>Windows</option>);
					adm_setTaskOptionPlatform.push(<option value="linux" selected={(this.state.ParamSix === 'linux')?true:false}>Linux</option>);
					var adm_setTaskOptionPlatformSet = <p><select size="1" name="SetParamSix" onChange={this.onChangeHandler.bind(this)}> {adm_setTaskOptionPlatform} </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div> {adm_setTaskOptionPlatformSet} </div>);
					//поле ввода зависимостей
					AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenterRight">Зависимости (необязательно, через ;): <input type="text" name="SetParamSeven" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamSeven.join(';')} /></div>);
					//флаг выбора объектов
					var AdminIoCommanderPanelBodyMiddleClients = new Array;
					var div_val = 0;
					var tempGroup = '';
					for(var keyUser in serverStorage.getState().users){
						var thisGroupArr = keyUser.split('_');
						var thisGroup = thisGroupArr[0];
						if(!((tempGroup === '') || (tempGroup === thisGroup))){
							AdminIoCommanderPanelBodyMiddleClients.push(<div className={'clientObject0'}><br /></div>);
							div_val = 0;
						}
						AdminIoCommanderPanelBodyMiddleClients.push(<div className={'clientObject' + div_val}>{replacer(keyUser, false)}: <input type="checkbox" name="SetParamEight" onChange={this.onChangeHandler.bind(this)} value={replacer(keyUser, false)} checked={(this.state.ParamEight.indexOf(replacer(keyUser, false)) === -1)?false:true} /></div>);
						if(div_val <5){
							div_val++;
						} else {
							div_val = 0;
						}
						tempGroup = thisGroup;
					}
					var AdminIoCommanderPanelBodyMiddleGroupsSet = new Array;
					AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value="">Выберите группу (не обязательно)</option>);
					for(var keyGroup in connectionStorage.getState().groups){
						AdminIoCommanderPanelBodyMiddleGroupsSet.push(<option value={keyGroup} selected={(this.state.ParamEleven === keyGroup)?true:false}>{keyGroup}</option>);
					}
					var AdminIoCommanderPanelBodyMiddleGroups = <p><select size="1" name="SetParamEleven" onChange={this.onChangeHandler.bind(this)}> {AdminIoCommanderPanelBodyMiddleGroupsSet} </select></p>;
					AdminIoCommanderPanelBodyMiddle.push(<div>Объекты:<br /> {AdminIoCommanderPanelBodyMiddleGroups}<br /><div className="objectTable">{AdminIoCommanderPanelBodyMiddleClients}</div> </div>);
				}
				break;
			case 'adm_setUser':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Логин: <input type="text" name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Пароль: <input type="text" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_setAdmin':
				//поле ввода логина
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Логин: <input type="text" name="SetParamOne" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamOne} /></div>);
				//поле ввода пароля
				AdminIoCommanderPanelBodyMiddle.push(<div className="inputFieldCenter">Пароль: <input type="text" name="SetParamTwo" onChange={this.onChangeHandler.bind(this)} value={this.state.ParamTwo} /></div>);
				break;
			case 'adm_delUser':
				//выпадающий список пользователей
				var adm_delUserOption = new Array;
				adm_delUserOption.push(<option value="">Выберите пользователя</option>);
				for(var keyUser in serverStorage.getState().users){
					adm_delUserOption.push(<option value={keyUser} selected={(this.state.ParamOne === keyUser)?true:false} >{replacer(keyUser, false)}</option>);
				}
				var adm_delUser = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delUserOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delUser} </div>);
				break;
			case 'adm_delAdmin':
				//выпадающий список администраторов
				var adm_delAdminOption = new Array;
				adm_delAdminOption.push(<option value="">Выберите пользователя</option>);
				for(var keyAdmin in serverStorage.getState().admins){
					adm_delAdminOption.push(<option value={keyAdmin} selected={(this.state.ParamOne === keyAdmin)?true:false} >{replacer(keyAdmin, false)}</option>);
				}
				var adm_delAdmin = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_delAdminOption} + </select></p>;
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_delAdmin} </div>);
				break;
			case 'adm_TaskReport':
				//отчеты по таскам
				var adm_TaskReportOption = new Array;
				adm_TaskReportOption.push(<option value="">Выберите задачу</option>);
				for(var keyTask in connectionStorage.getState().report){ 
					var dateEpochToString = new Date(connectionStorage.getState().report[keyTask].datetime);
					adm_TaskReportOption.push(<option value={keyTask} selected={(this.state.ParamOne === keyTask)?true:false} >{timeStamp(dateEpochToString) + '_' + connectionStorage.getState().report[keyTask].comment}</option>);
				}
				var adm_TaskReport = <p><select size="1" name="SetParamOne" onChange={this.onChangeHandler.bind(this)}> + {adm_TaskReportOption} + </select></p>;
				var adm_TaskReportResult = new Array;
				if(this.state.ParamOne !== ""){
					var tempStorage = connectionStorage.getState().report;
					var reportTaskCOMPLETE = '',
						reportTaskERRORS = '',
						reportTaskTEXT = '',
						reportTaskDEPEN = '';
					if(tempStorage[this.state.ParamOne].incomplete.length > 0) {
						reportTaskCOMPLETE = <div className="textRED" id="blink1"> Есть невыполненные задания! </div>;
					} else if (tempStorage[this.state.ParamOne].errors === 0) {
						reportTaskCOMPLETE = <div className="textGREEN" id="blink1"> Все задания выполнены! </div>;
					}
					if(tempStorage[this.state.ParamOne].errors > 0) {
						reportTaskERRORS = <div className="textRED" id="blink2"> Есть ошибки выполнения! </div>;
					}
					var reportTaskUID = <div> UID: {this.state.ParamOne} </div>;
					if((typeof(tempStorage[this.state.ParamOne].text) === 'string') && (tempStorage[this.state.ParamOne].text !== '')){
						reportTaskTEXT = <div> {tempStorage[this.state.ParamOne].text} </div>;
					}
					if((typeof(tempStorage[this.state.ParamOne].dependencies) === 'string') && (tempStorage[this.state.ParamOne].dependencies !== '')){
						reportTaskDEPEN = <div> Зависимости: {tempStorage[this.state.ParamOne].dependencies} </div>;
					}
					adm_TaskReportResult.push(<div className={'reportTableRow'}> {reportTaskUID} {reportTaskCOMPLETE} {reportTaskERRORS} {reportTaskTEXT} {reportTaskDEPEN}  <br /> </div>)
					if(typeof(tempStorage[this.state.ParamOne]) !== 'undefined'){
						var tempObjects = tempStorage[this.state.ParamOne].objects;
						if(typeof(tempObjects) !== 'undefined'){
							var adm_TaskReportResultRow = new Array;
							adm_TaskReportResultRow.push(<div className="reportTableColumnName">Учетная запись</div>);
							adm_TaskReportResultRow.push(<div className="reportTableColumnStatus">Статус выполнения</div>);
							adm_TaskReportResultRow.push(<div className="reportTableColumnAnswer">Вывод (ответ) консоли</div>);
							adm_TaskReportResultRow.push(<div className="reportTableColumnDate">Дата создания</div>);
							adm_TaskReportResultRow.push(<div className="reportTableColumnDateTimeout">Выполнять после</div>);
							adm_TaskReportResultRow.push(<div className="reportTableColumnDateCompl">Дата выполнения</div>);
							adm_TaskReportResult.push(<div className="reportTableRow reportTableRowHeader">{adm_TaskReportResultRow}</div>);
							adm_TaskReportResultRow = null;
							for(var keyObject in tempObjects){
								var adm_TaskReportResultRow = new Array;
								adm_TaskReportResultRow.push(<div className="reportTableColumnName">{keyObject}</div>);
								adm_TaskReportResultRow.push(<div className="reportTableColumnStatus">{((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'Выполнено':'Не выполнено'}</div>);
								adm_TaskReportResultRow.push(<div className="reportTableColumnAnswer">{(tempObjects[keyObject].answer === 'none')?'':tempObjects[keyObject].answer.split('\n').map( (it, i) => <div key={'x'+i}>{it}</div> )}</div>);
								var dateEpochToString = new Date(tempObjects[keyObject].datetime);
								adm_TaskReportResultRow.push(<div className="reportTableColumnDate">{timeStamp(dateEpochToString)}</div>);
								if((tempObjects[keyObject].datetimeout !== 0) && (typeof(tempObjects[keyObject].datetimeout) !== 'undefined')){
									var dateEpochToStringTimeout = new Date(tempObjects[keyObject].datetimeout);
								} else {
									var dateEpochToStringTimeout = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
								}
								adm_TaskReportResultRow.push(<div className="reportTableColumnDateTimeout">{timeStamp(dateEpochToStringTimeout)}</div>);
								if(tempObjects[keyObject].datetimecompl !== 0){
									var dateEpochToStringCompl = new Date(tempObjects[keyObject].datetimecompl);
								} else {
									var dateEpochToStringCompl = null; //т.к. таймштамп не сможет получить дату от Null, то вернет нули в эксепшн
								}
								adm_TaskReportResultRow.push(<div className="reportTableColumnDateCompl">{timeStamp(dateEpochToStringCompl)}</div>);								
								adm_TaskReportResult.push(<div className={'reportTableRow reportTableRow'+(((tempObjects[keyObject].complete === 'true') && (tempObjects[keyObject].tryval < 100))?'true':'false')}>{adm_TaskReportResultRow}</div>);
							}
						}
					}
				}
				AdminIoCommanderPanelBodyMiddle.push(<div> {adm_TaskReport} <div className="reportTable">{adm_TaskReportResult}</div></div>);
				break;
			case 'adm_TaskOnline':
				//отчет по онлайну
				var adm_OnlineOn = new Array; 
				var adm_OnlineOff = new Array; 
				for(var keyOnlineAll in serverStorage.getState().users){
					if(typeof(connectionStorage.getState().users[keyOnlineAll]) !== 'undefined'){
						adm_OnlineOn.push(<div className={"adm_OnlineOn0"}><div>{replacer(keyOnlineAll, false)}</div><div className={(connectionStorage.getState().versions[keyOnlineAll] !== connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(connectionStorage.getState().versions[keyOnlineAll]) === 'string')?connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
					} else {
						adm_OnlineOff.push(<div className={"adm_OnlineOff0"}><div>{replacer(keyOnlineAll, false)}</div><div className={(connectionStorage.getState().versions[keyOnlineAll] !== connectionStorage.getState().version)?'textYELLOW':''}>Версия: {(typeof(connectionStorage.getState().versions[keyOnlineAll]) === 'string')?connectionStorage.getState().versions[keyOnlineAll]:'undefinied'}</div></div>);
					}
				}
				AdminIoCommanderPanelBodyMiddle.push(<div className="reportOnline"> {(adm_OnlineOn.length !== 0)?<div className="adm_OnlineOn">{adm_OnlineOn}</div>:''} {(adm_OnlineOff.length !== 0)?<div className="adm_OnlineOff">{adm_OnlineOff}</div>:''}</div>);
				break;
			default:
				AdminIoCommanderPanelBodyMiddle.push(<div> Неизвестный тип команды! </div>);
				break;
		};
		if ((this.state.CommandType !== 'adm_TaskReport') && (this.state.CommandType !== 'adm_TaskOnline')){
			var AdminIoCommanderPanelBodyBottom = <div className={"AdminIoCommanderPanelBodyBottom" + ((this.state.CommandType === 'adm_setTask')?" inputFieldCenterRight inputFieldCenterRightBotton":"") + (((this.state.CommandType === 'adm_setUser') || this.state.CommandType === 'adm_setAdmin')?" inputFieldCenter":"") + (((this.state.CommandType === 'adm_delUser') || this.state.CommandType === 'adm_delAdmin')?" inputFieldCenterReal":"")}><button onClick={this.onBtnClickHandler.bind(this)} id='submit'>Выполнить</button></div>;
		}
		return (
			<div className="AdminIoCommanderPanelBody">
				{AdminIoCommanderPanelBodyHeader}
				<div className="PanelBodyMargin">
					<center>
						{AdminIoCommanderPanelBodyMiddle}
						{AdminIoCommanderPanelBodyBottom}
					</center>
				</div>
			</div>
		);
	}
	
}

class AdminIoCommanderPanelBottom extends React.PureComponent{
  
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
			let temp = target.getAttribute('data-tooltip').toString();
			let temparr = temp.split(',');
			let temparrnew = new Array;
			for(let i = 0; i < temparr.length; i = i + 6){
				let tempstring;
				for(let j = i; j < i + 6; j++){
					if(typeof(temparr[j]) !== 'undefined'){
						if(j === i){ 
							tempstring = '<div class="tooltipTCol' + (j % 6) + '">' + temparr[j].toString() + '</div>';
						} else {
							tempstring = tempstring + '<div class="tooltipTCol' + (j % 6) + '">' + temparr[j].toString() + '</div>';
						}
					}
				}
				temparrnew.push(tempstring);
			}
			let tempstringnew = '';
			for(let i = 0; i < temparrnew.length; i++){
				tempstringnew = tempstringnew + '<div class="tooltipTLine">' + temparrnew[i] + '</div>';
			}
			//var tooltip = temp.replace(/\,/gi,"<br>"); //старый вариант в виде столбца
			var tooltip =tempstringnew;
			if (!tooltip) return;

			var tooltipElem = document.createElement('div');
			tooltipElem.className = 'tooltip';
			tooltipElem.innerHTML = tooltip;
			document.body.appendChild(tooltipElem);

			var coords = target.getBoundingClientRect();
			var left = coords.left - tooltipElem.offsetWidth + target.offsetWidth;
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
				<div className="AdminIoCommanderPanelBottomServerStat">
					<div>{this.props.datatwo[0]}</div>
					<div>{this.props.datatwo[1]}</div>
				</div>
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

class AdminIoCommanderPanel extends React.PureComponent{
  
   constructor(props, context){
		super(props, context);
		this.state = {
			OnlineUsers: {},
			clientUsers: {},
			adminUsers: {},
			auth: false,
			memory: '',
			cpu: '',
		};
    }
      
	componentDidMount() {
		var self = this;
		serverStorage.subscribe(function(){
			self.setState({clientUsers: serverStorage.getState().users, adminUsers: serverStorage.getState().admins});
		});
		connectionStorage.subscribe(function(){
			self.setState({OnlineUsers: connectionStorage.getState().users, memory: connectionStorage.getState().memory, cpu: connectionStorage.getState().cpu});
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
				<AdminIoCommanderPanelPopup />
				{(this.state.auth)?<AdminIoCommanderPanelBody />:<AdminIoCommanderPanelAuth />}
				<AdminIoCommanderPanelBottom data={this.state.OnlineUsers} datatwo={[this.state.memory, this.state.cpu]} />
			</div>
		);
	}
};

ReactDOM.render(
	<AdminIoCommanderPanel />,
	document.getElementById('AdminIoCommander')
);