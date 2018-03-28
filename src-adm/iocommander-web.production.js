'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a};function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function _inherits(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}var AdminIoCommanderPanelPopup=function(a){function b(c,d){_classCallCheck(this,b);var f=_possibleConstructorReturn(this,a.call(this,c,d));return f.state={PopupText:''},f.onDivClickHandler=f.onDivClickHandler.bind(f),f}return _inherits(b,a),b.prototype.componentDidMount=function componentDidMount(){var c=this;adminpanelStorage.subscribe(function(){c.setState({PopupText:adminpanelStorage.getState().popuptext}),''!==adminpanelStorage.getState().popuptext&&setTimeout(function(){adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:''}})},2e3)})},b.prototype.onDivClickHandler=function onDivClickHandler(){this.setState({PopupText:''})},b.prototype.render=function render(){return React.createElement('div',{className:''==this.state.PopupText?'popup unshow':'popup show',onClick:this.onDivClickHandler},React.createElement('span',{className:'popuptext',id:'myPopup'},this.state.PopupText))},b}(React.Component);var AdminIoCommanderPanelAuth=function(a){function b(c,d){_classCallCheck(this,b);var f=_possibleConstructorReturn(this,a.call(this,c,d));return f.state={login:'',password:''},f}return _inherits(b,a),b.prototype.onChangeHandler=function onChangeHandler(c){switch(c.target.name){case'SetParamLogin':this.setState({login:c.target.value});break;case'SetParamPassword':this.setState({password:c.target.value});}},b.prototype.onBtnClickHandler=function onBtnClickHandler(c){'submit'===c.target.id&&initialiseSocket(this.state.login,this.state.password)},b.prototype.render=function render(){var c=[],d=[];return d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041B\u043E\u0433\u0438\u043D: ',React.createElement('input',{type:'text',name:'SetParamLogin',autocomplete:'username',onChange:this.onChangeHandler.bind(this),value:this.state.login}))),d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041F\u0430\u0440\u043E\u043B\u044C: ',React.createElement('input',{type:'password',name:'SetParamPassword',autocomplete:'current-password',onChange:this.onChangeHandler.bind(this),value:this.state.password}))),c.push(React.createElement('form',null,d)),c.push(React.createElement('div',{className:'inputFieldCenter'},React.createElement('button',{onClick:this.onBtnClickHandler.bind(this),id:'submit'},'\u0412\u043E\u0439\u0442\u0438'))),React.createElement('div',{className:'AdminIoCommanderPanelAuth'},c)},b}(React.Component),AdminIoCommanderPanelHeader=function(a){function b(c,d){return _classCallCheck(this,b),_possibleConstructorReturn(this,a.call(this,c,d))}return _inherits(b,a),b.prototype.render=function render(){return React.createElement('div',{className:'AdminIoCommanderPanelHeader'},React.createElement('h2',null,' \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 IoCommander v1.0.0 '))},b}(React.Component),AdminIoCommanderPanelBody=function(a){function b(c,d){_classCallCheck(this,b);var f=_possibleConstructorReturn(this,a.call(this,c,d));return f.state={CommandType:'adm_setTask',ParamOne:generateUID(),ParamTwo:'',ParamThird:'',ParamFour:'',ParamFive:'',ParamSix:'',ParamSeven:[],ParamEight:[],ParamTen:'',ParamEleven:''},f}return _inherits(b,a),b.prototype.onClickHandler=function onClickHandler(c){switch(c.target.name){case'CommandType':this.setState({CommandType:c.target.id}),'adm_setTask'===c.target.id?this.setState({ParamOne:generateUID()}):this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''});break;default:}},b.prototype.onChangeHandler=function onChangeHandler(c){var d=/^.*[^A-z0-9.?\/&_:-].*$/;switch(c.target.name){case'SetParamOne':var f=/^.*[^A-z0-9._-].*$/;f.test(c.target.value)?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamOne:c.target.value});break;case'SetParamTwo':this.setState({ParamTwo:c.target.value});break;case'SetParamThird':var f=/^.*[^A-z0-9. "|()[^$*+?\/&_:!@-].*$/;d.test(c.target.value)||'execCommand'===this.state.ParamTwo?f.test(c.target.value)||'execCommand'!==this.state.ParamTwo?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamThird:c.target.value.replace(/\\/gi,'/')}):this.setState({ParamThird:c.target.value.replace(/\\/gi,'/')});break;case'SetParamFour':d.test(c.target.value)?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamFour:c.target.value.replace(/\\/gi,'/')});break;case'SetParamFive':var f=/^.*[^A-z0-9.?\/&_:-].*$/;d.test(c.target.value)||'execFile'===this.state.ParamTwo?f.test(c.target.value)||'execFile'!==this.state.ParamTwo?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamFive:c.target.value.replace(/\\/gi,'/')}):this.setState({ParamFive:c.target.value.replace(/\\/gi,'/')});break;case'SetParamSix':d.test(c.target.value)?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamSix:c.target.value});break;case'SetParamSeven':var f=/^.*[^A-z0-9;-].*$/;if(!f.test(c.target.value)){var g=c.target.value.split(';');this.setState({ParamSeven:g})}else adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}});break;case'SetParamEight':var f=/^.*[^A-z0-9._-].*$/;if(!f.test(c.target.value)){var h=this.state.ParamEight.slice();c.target.checked?(h.push(c.target.value),this.setState({ParamEight:h})):(h.splice(h.indexOf(c.target.value),1),this.setState({ParamEight:h}))}else adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}});break;case'SetParamNine':var f=/^.*[^A-z0-9А-я ].*$/;f.test(c.target.value)?adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}}):this.setState({ParamNine:c.target.value});break;case'SetParamTen':var f=/^.*[^0-9T:-].*$/;if(!f.test(c.target.value))switch(c.target.value.length){case 4:this.setState({ParamTen:c.target.value+'-'});break;case 7:this.setState({ParamTen:c.target.value+'-'});break;case 10:this.setState({ParamTen:c.target.value+'T'});break;case 13:this.setState({ParamTen:c.target.value+':'});break;case 16:this.setState({ParamTen:c.target.value+':'});break;default:20>c.target.value.length&&this.setState({ParamTen:c.target.value});}else adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0441\u0438\u043C\u0432\u043E\u043B!'}});break;case'SetParamEleven':if(''!==c.target.value){for(var j=_.clone(connectionStorage.getState().groups[c.target.value]),k=_.clone(this.state.ParamEight),l=0;l<j.length;l++)-1===k.indexOf(j[l])&&k.push(j[l]);this.setState({ParamEight:k}),this.setState({ParamEleven:c.target.value})}else{for(var j=_.clone(connectionStorage.getState().groups[this.state.ParamEleven]),k=_.clone(this.state.ParamEight),l=0;l<j.length;l++)-1!==k.indexOf(j[l])&&k.splice(k.indexOf(j[l]),1);this.setState({ParamEight:k}),this.setState({ParamEleven:c.target.value})}break;default:}},b.prototype.onBtnClickHandler=function onBtnClickHandler(c){if('submit'===c.target.id)if('undefined'!=typeof window.socket)switch(this.state.CommandType){case'adm_setTask':var d=!1;if('string'==typeof this.state.ParamOne&&''!==this.state.ParamOne&&'string'==typeof this.state.ParamTwo&&''!==this.state.ParamTwo&&'string'==typeof this.state.ParamSix&&''!==this.state.ParamSix&&'object'===_typeof(this.state.ParamSeven)&&'object'===_typeof(this.state.ParamEight)){var f;try{f=new Date(this.state.ParamTen)}catch(n){f=new Date(0)}switch(this.state.ParamTwo){case'getFileFromWWW':if('string'==typeof this.state.ParamThird&&''!==this.state.ParamThird&&'string'==typeof this.state.ParamFour&&''!==this.state.ParamFour&&'string'==typeof this.state.ParamFive&&''!==this.state.ParamFive){var g={uid:this.state.ParamOne,task:{nameTask:this.state.ParamTwo,extLink:this.state.ParamThird,intLink:this.state.ParamFour,fileName:this.state.ParamFive,exec:'false',complete:'false',answer:'',platform:this.state.ParamSix,dependencies:this.state.ParamSeven,comment:this.state.ParamNine,timeoncompl:f.getTime()}};d=!0}else console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}});break;case'execFile':if('string'==typeof this.state.ParamThird&&'string'==typeof this.state.ParamFour&&''!==this.state.ParamFour&&'string'==typeof this.state.ParamFive){var g={uid:this.state.ParamOne,task:{nameTask:this.state.ParamTwo,intLink:this.state.ParamThird,fileName:this.state.ParamFour,paramArray:[this.state.ParamFive],complete:'false',answer:'',platform:this.state.ParamSix,dependencies:this.state.ParamSeven,comment:this.state.ParamNine,timeoncompl:f.getTime()}};d=!0}else console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}});break;case'execCommand':if('string'==typeof this.state.ParamThird&&''!==this.state.ParamThird){var g={uid:this.state.ParamOne,task:{nameTask:this.state.ParamTwo,execCommand:this.state.ParamThird,platform:this.state.ParamSix,dependencies:this.state.ParamSeven,comment:this.state.ParamNine,timeoncompl:f.getTime()}};d=!0}else console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}});break;case'getFileFromFileserver':this;SendFileToInternalFS(this.refs.FileUploadToServer.files,this.state.ParamOne,this.state.ParamFour,this.state.ParamSix,this.state.ParamSeven,this.state.ParamNine,f,this.state.ParamEight);}}else console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}});if(d&&0<this.state.ParamEight.length){if('getFileFromFileserver'!==this.state.ParamTwo)for(var k,j=0;j<this.state.ParamEight.length;j++)k=[this.state.ParamEight[j],g],window.socket.emit('adm_setTask',k);this.setState({ParamOne:generateUID()}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})}else console.log(datetime()+'\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0437\u0430\u0434\u0430\u0447\u0438!');break;case'adm_setUser':var l=this.state.ParamOne,m=this.state.ParamTwo;'string'==typeof l&&''!==l&&'string'==typeof m&&''!==m?(window.socket.emit('adm_setUser',[l,CryptoJS.SHA256(l+m+'icommander').toString()]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));break;case'adm_setAdmin':var l=this.state.ParamOne,m=this.state.ParamTwo;'string'==typeof l&&''!==l&&'string'==typeof m&&''!==m?(window.socket.emit('adm_setAdmin',[l,CryptoJS.SHA256(l+m+'icommander').toString()]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));break;case'adm_delUser':var l=this.state.ParamOne;'string'==typeof l&&''!==l?(window.socket.emit('adm_delUser',[l]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));break;case'adm_delAdmin':var l=this.state.ParamOne;'string'==typeof l&&''!==l?(window.socket.emit('adm_delAdmin',[l]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));break;case'adm_TaskReport':var l=this.state.ParamOne;'string'==typeof l&&''!==l?(window.socket.emit('adm_delAdmin',[l]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));break;case'adm_TaskOnline':var l=this.state.ParamOne;'string'==typeof l&&''!==l?(window.socket.emit('adm_delAdmin',[l]),this.setState({ParamOne:''}),this.setState({ParamTwo:''}),this.setState({ParamThird:''}),this.setState({ParamFour:''}),this.setState({ParamFive:''}),this.setState({ParamSix:''}),this.setState({ParamSeven:[]}),this.setState({ParamEight:[]}),this.setState({ParamNine:''}),this.setState({ParamTen:''}),this.setState({ParamEleven:''})):(console.log(datetime()+'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u044B!'}}));}else console.log(datetime()+'\u0421\u043E\u043A\u0435\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u0421\u043E\u043A\u0435\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D!'}})},b.prototype.render=function render(){var c=React.createElement('center',null,React.createElement('p',null,React.createElement('img',{className:'imgCommandType',src:'./img/adm_settask.png',alt:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443',title:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443',name:'CommandType',id:'adm_setTask',onClick:this.onClickHandler.bind(this),border:'adm_setTask'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_setuser.png',alt:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F',title:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F',name:'CommandType',id:'adm_setUser',onClick:this.onClickHandler.bind(this),border:'adm_setUser'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_setadmin.png',alt:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430',title:'\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430',name:'CommandType',id:'adm_setAdmin',onClick:this.onClickHandler.bind(this),border:'adm_setAdmin'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_deluser.png',alt:'\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F',title:'\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F',name:'CommandType',id:'adm_delUser',onClick:this.onClickHandler.bind(this),border:'adm_delUser'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_deladmin.png',alt:'\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430',title:'\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430',name:'CommandType',id:'adm_delAdmin',onClick:this.onClickHandler.bind(this),border:'adm_delAdmin'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_report.png',alt:'\u041E\u0442\u0447\u0435\u0442\u044B \u043F\u043E \u0442\u0430\u0441\u043A\u0430\u043C',title:'\u041E\u0442\u0447\u0435\u0442\u044B \u043F\u043E \u0442\u0430\u0441\u043A\u0430\u043C',name:'CommandType',id:'adm_TaskReport',onClick:this.onClickHandler.bind(this),border:'adm_TaskReport'===this.state.CommandType?'2':'0'}),React.createElement('img',{className:'imgCommandType',src:'./img/adm_online.png',alt:'\u0422\u0435\u043A\u0443\u0449\u0438\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F',title:'\u0422\u0435\u043A\u0443\u0449\u0438\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F',name:'CommandType',id:'adm_TaskOnline',onClick:this.onClickHandler.bind(this),border:'adm_TaskOnline'===this.state.CommandType?'2':'0'}))),d=[];switch(this.state.CommandType){case'adm_setTask':d.push(React.createElement('div',null,'UID: ',this.state.ParamOne));var f=[];f.push(React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0437\u0430\u0434\u0430\u043D\u0438\u044F')),f.push(React.createElement('option',{value:'getFileFromWWW',selected:'getFileFromWWW'===this.state.ParamTwo},'\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0444\u0430\u0439\u043B \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435')),f.push(React.createElement('option',{value:'getFileFromFileserver',selected:'getFileFromFileserver'===this.state.ParamTwo},'\u041F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0444\u0430\u0439\u043B')),f.push(React.createElement('option',{value:'execFile',selected:'execFile'===this.state.ParamTwo},'\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043A\u0440\u0438\u043F\u0442')),f.push(React.createElement('option',{value:'execCommand',selected:'execCommand'===this.state.ParamTwo},'\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043A\u043E\u043C\u0430\u043D\u0434\u0443'));var g=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamTwo',onChange:this.onChangeHandler.bind(this)},' ',f,' '));switch(d.push(React.createElement('div',null,' ',g,' ')),''!==this.state.ParamTwo&&(d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 (\u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430): ',React.createElement('input',{type:'text',name:'SetParamNine',onChange:this.onChangeHandler.bind(this),value:this.state.ParamNine}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435 (2018-03-19T18:37:00): ',React.createElement('input',{type:'text',name:'SetParamTen',onChange:this.onChangeHandler.bind(this),value:this.state.ParamTen})))),this.state.ParamTwo){case'getFileFromWWW':d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u043B\u044F \u0441\u043A\u0430\u0447\u043A\u0438: ',React.createElement('input',{type:'text',name:'SetParamThird',onChange:this.onChangeHandler.bind(this),value:'string'==typeof this.state.ParamThird?this.state.ParamThird:null}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u0442\u044C: ',React.createElement('input',{type:'text',name:'SetParamFour',onChange:this.onChangeHandler.bind(this),value:this.state.ParamFour}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0418\u043C\u044F \u0444\u0430\u0439\u043B\u0430: ',React.createElement('input',{type:'text',name:'SetParamFive',onChange:this.onChangeHandler.bind(this),value:this.state.ParamFive})));break;case'execFile':d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041F\u0443\u0442\u044C \u043A \u0441\u043A\u0440\u0438\u043F\u0442\u0443: ',React.createElement('input',{type:'text',name:'SetParamThird',onChange:this.onChangeHandler.bind(this),value:'string'==typeof this.state.ParamThird?this.state.ParamThird:null}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0418\u043C\u044F \u0441\u043A\u0440\u0438\u043F\u0442\u0430: ',React.createElement('input',{type:'text',name:'SetParamFour',onChange:this.onChangeHandler.bind(this),value:this.state.ParamFour}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0437\u0430\u043F\u0443\u0441\u043A\u0430: ',React.createElement('input',{type:'text',name:'SetParamFive',onChange:this.onChangeHandler.bind(this),value:this.state.ParamFive})));break;case'execCommand':d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041A\u043E\u043C\u0430\u043D\u0434\u0430: ',React.createElement('input',{type:'text',name:'SetParamThird',onChange:this.onChangeHandler.bind(this),value:'string'==typeof this.state.ParamThird?this.state.ParamThird:null})));break;case'getFileFromFileserver':d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0424\u0430\u0439\u043B: ',React.createElement('input',{type:'file',ref:'FileUploadToServer'}))),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u0442\u044C: ',React.createElement('input',{type:'text',name:'SetParamFour',onChange:this.onChangeHandler.bind(this),value:this.state.ParamFour})));}if(''!==this.state.ParamTwo){var h=[React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443'),React.createElement('option',{value:'all',selected:'all'===this.state.ParamSix},'\u041B\u044E\u0431\u0430\u044F'),React.createElement('option',{value:'win32',selected:'win32'===this.state.ParamSix},'Windows'),React.createElement('option',{value:'linux',selected:'linux'===this.state.ParamSix},'Linux')],j=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamSix',onChange:this.onChangeHandler.bind(this)},' ',h,' '));d.push(React.createElement('div',null,' ',j,' ')),d.push(React.createElement('div',{className:'inputFieldCenterRight'},'\u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E, \u0447\u0435\u0440\u0435\u0437 ;): ',React.createElement('input',{type:'text',name:'SetParamSeven',onChange:this.onChangeHandler.bind(this),value:this.state.ParamSeven.join(';')})));var k=[],l=0;for(var m in serverStorage.getState().users)k.push(React.createElement('div',{className:'clientObject'+l},replacer(m,!1),': ',React.createElement('input',{type:'checkbox',name:'SetParamEight',onChange:this.onChangeHandler.bind(this),value:replacer(m,!1),checked:-1!==this.state.ParamEight.indexOf(replacer(m,!1))}))),5>l?l++:l=0;var n=[];for(var o in n.push(React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u0440\u0443\u043F\u043F\u0443 (\u043D\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)')),connectionStorage.getState().groups)n.push(React.createElement('option',{value:o,selected:this.state.ParamEleven===o},o));var p=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamEleven',onChange:this.onChangeHandler.bind(this)},' ',n,' '));d.push(React.createElement('div',null,'\u041E\u0431\u044A\u0435\u043A\u0442\u044B:',React.createElement('br',null),' ',p,React.createElement('br',null),React.createElement('div',{className:'objectTable'},k),' '))}break;case'adm_setUser':d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041B\u043E\u0433\u0438\u043D: ',React.createElement('input',{type:'text',name:'SetParamOne',onChange:this.onChangeHandler.bind(this),value:this.state.ParamOne}))),d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041F\u0430\u0440\u043E\u043B\u044C: ',React.createElement('input',{type:'text',name:'SetParamTwo',onChange:this.onChangeHandler.bind(this),value:this.state.ParamTwo})));break;case'adm_setAdmin':d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041B\u043E\u0433\u0438\u043D: ',React.createElement('input',{type:'text',name:'SetParamOne',onChange:this.onChangeHandler.bind(this),value:this.state.ParamOne}))),d.push(React.createElement('div',{className:'inputFieldCenter'},'\u041F\u0430\u0440\u043E\u043B\u044C: ',React.createElement('input',{type:'text',name:'SetParamTwo',onChange:this.onChangeHandler.bind(this),value:this.state.ParamTwo})));break;case'adm_delUser':var q=[];for(var m in q.push(React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F')),serverStorage.getState().users)q.push(React.createElement('option',{value:m,selected:this.state.ParamOne===m},replacer(m,!1)));var r=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamOne',onChange:this.onChangeHandler.bind(this)},' + ',q,' + '));d.push(React.createElement('div',null,' ',r,' '));break;case'adm_delAdmin':var s=[];for(var t in s.push(React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F')),serverStorage.getState().admins)s.push(React.createElement('option',{value:t,selected:this.state.ParamOne===t},replacer(t,!1)));var u=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamOne',onChange:this.onChangeHandler.bind(this)},' + ',s,' + '));d.push(React.createElement('div',null,' ',u,' '));break;case'adm_TaskReport':var v=[];for(var w in v.push(React.createElement('option',{value:''},'\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0430\u0434\u0430\u0447\u0443')),connectionStorage.getState().report){var x=new Date(connectionStorage.getState().report[w].datetime);v.push(React.createElement('option',{value:w,selected:this.state.ParamOne===w},timeStamp(x)+'_'+connectionStorage.getState().report[w].comment))}var y=React.createElement('p',null,React.createElement('select',{size:'1',name:'SetParamOne',onChange:this.onChangeHandler.bind(this)},' + ',v,' + ')),z=[];if(''!==this.state.ParamOne){var A=connectionStorage.getState().report;if(z.push(React.createElement('div',{className:'reportTableRow'},this.state.ParamOne)),'undefined'!=typeof A[this.state.ParamOne]){var B=A[this.state.ParamOne].objects;if('undefined'!=typeof B){var C=[];for(var D in C.push(React.createElement('div',{className:'reportTableColumnName'},'\u0423\u0447\u0435\u0442\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C')),C.push(React.createElement('div',{className:'reportTableColumnStatus'},'\u0421\u0442\u0430\u0442\u0443\u0441 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F')),C.push(React.createElement('div',{className:'reportTableColumnAnswer'},'\u0412\u044B\u0432\u043E\u0434 (\u043E\u0442\u0432\u0435\u0442) \u043A\u043E\u043D\u0441\u043E\u043B\u0438')),C.push(React.createElement('div',{className:'reportTableColumnDate'},'\u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F')),C.push(React.createElement('div',{className:'reportTableColumnDateTimeout'},'\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0442\u044C \u043F\u043E\u0441\u043B\u0435')),C.push(React.createElement('div',{className:'reportTableColumnDateCompl'},'\u0414\u0430\u0442\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F')),z.push(React.createElement('div',{className:'reportTableRow reportTableRowHeader'},C)),C=null,B){var C=[React.createElement('div',{className:'reportTableColumnName'},D),React.createElement('div',{className:'reportTableColumnStatus'},'true'===B[D].complete&&100>B[D].tryval?'\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E':'\u041D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E'),React.createElement('div',{className:'reportTableColumnAnswer'},'none'===B[D].answer?'':B[D].answer)],x=new Date(B[D].datetime);if(C.push(React.createElement('div',{className:'reportTableColumnDate'},timeStamp(x))),0!==B[D].datetimeout&&'undefined'!=typeof B[D].datetimeout)var E=new Date(B[D].datetimeout);else var E=null;if(C.push(React.createElement('div',{className:'reportTableColumnDateTimeout'},timeStamp(E))),0!==B[D].datetimecompl)var F=new Date(B[D].datetimecompl);else var F=null;C.push(React.createElement('div',{className:'reportTableColumnDateCompl'},timeStamp(F))),z.push(React.createElement('div',{className:'reportTableRow reportTableRow'+('true'===B[D].complete&&100>B[D].tryval?'true':'false')},C))}}}}d.push(React.createElement('div',null,' ',y,' ',React.createElement('div',{className:'reportTable'},z)));break;case'adm_TaskOnline':var G=[],H=0,I=[],J=0;for(var K in serverStorage.getState().users)'undefined'==typeof connectionStorage.getState().users[K]?(I.push(React.createElement('div',{className:'adm_OnlineOff'+J},replacer(K,!1))),4>J?J++:J=0):(G.push(React.createElement('div',{className:'adm_OnlineOn'+H},replacer(K,!1))),4>H?H++:H=0);0===G.length&&G.push(React.createElement('div',{className:'adm_OnlineZero'})),0===I.length&&I.push(React.createElement('div',{className:'adm_OnlineZero'})),d.push(React.createElement('div',{className:'reportOnline'},' ',React.createElement('div',{className:'adm_OnlineOn'},G),React.createElement('div',{className:'adm_OnlineOff'},I),' '));break;default:d.push(React.createElement('div',null,' \u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u043A\u043E\u043C\u0430\u043D\u0434\u044B! '));}if('adm_TaskReport'!==this.state.CommandType&&'adm_TaskOnline'!==this.state.CommandType)var L=React.createElement('div',{className:'AdminIoCommanderPanelBodyBottom'+('adm_setTask'===this.state.CommandType?' inputFieldCenterRight inputFieldCenterRightBotton':'')+('adm_setUser'===this.state.CommandType||'adm_setAdmin'===this.state.CommandType?' inputFieldCenter':'')+('adm_delUser'===this.state.CommandType||'adm_delAdmin'===this.state.CommandType?' inputFieldCenterReal':'')},React.createElement('button',{onClick:this.onBtnClickHandler.bind(this),id:'submit'},'\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C'));return React.createElement('div',{className:'AdminIoCommanderPanelBody'},c,React.createElement('div',{className:'PanelBodyMargin'},React.createElement('center',null,d,L)))},b}(React.Component),AdminIoCommanderPanelBottom=function(a){function b(c,d){return _classCallCheck(this,b),_possibleConstructorReturn(this,a.call(this,c,d))}return _inherits(b,a),b.prototype.componentDidMount=function componentDidMount(){var c;this.showingTooltip=c},b.prototype.MouseOver=function MouseOver(c){var d=c.target;if(null!==d.getAttribute('data-tooltip')){var f=d.getAttribute('data-tooltip').toString().replace(/\,/gi,'<br>');if(!f)return;var g=document.createElement('div');g.className='tooltip',g.innerHTML=f,document.body.appendChild(g);var h=d.getBoundingClientRect(),j=h.left+(d.offsetWidth-g.offsetWidth)/2;0>j&&(j=0);var k=h.top-g.offsetHeight-5;0>k&&(k=h.top+d.offsetHeight+5),g.style.left=j+'px',g.style.top=k+'px',this.showingTooltip=g}},b.prototype.MouseOut=function MouseOut(){this.showingTooltip&&(document.body.removeChild(this.showingTooltip),this.showingTooltip=null)},b.prototype.render=function render(){var c=[],d=[];for(var f in this.props.data)c.push(replacer(f,!1));for(var g in serverStorage.getState().users)-1===c.indexOf(replacer(g,!1))&&d.push(replacer(g,!1));for(var g in serverStorage.getState().admins)-1===c.indexOf(replacer(g,!1))&&d.push(replacer(g,!1));return React.createElement('div',{className:'AdminIoCommanderPanelBottom'},React.createElement('div',{className:'AdminIoCommanderPanelBottomUsersOnline','data-tooltip':c,onMouseOver:this.MouseOver.bind(this),onMouseOut:this.MouseOut.bind(this)},React.createElement('div',null,'Online: '+c.length)),React.createElement('div',{className:'AdminIoCommanderPanelBottomUsersOffline','data-tooltip':d,onMouseOver:this.MouseOver.bind(this),onMouseOut:this.MouseOut.bind(this)},React.createElement('div',null,'Offline: '+d.length)))},b}(React.Component),AdminIoCommanderPanel=function(a){function b(c,d){_classCallCheck(this,b);var f=_possibleConstructorReturn(this,a.call(this,c,d));return f.state={OnlineUsers:{},clientUsers:{},adminUsers:{},auth:!1},f}return _inherits(b,a),b.prototype.componentDidMount=function componentDidMount(){var c=this;serverStorage.subscribe(function(){c.setState({clientUsers:serverStorage.getState().users}),c.setState({adminUsers:serverStorage.getState().admins})}),connectionStorage.subscribe(function(){c.setState({OnlineUsers:connectionStorage.getState().users})}),adminpanelStorage.subscribe(function(){c.setState({auth:adminpanelStorage.getState().auth})})},b.prototype.componentWillUnmount=function componentWillUnmount(){},b.prototype.render=function render(){return React.createElement('div',{className:'AdminIoCommanderPanel'},React.createElement(AdminIoCommanderPanelHeader,null),React.createElement(AdminIoCommanderPanelPopup,null),this.state.auth?React.createElement(AdminIoCommanderPanelBody,null):React.createElement(AdminIoCommanderPanelAuth,null),React.createElement(AdminIoCommanderPanelBottom,{data:this.state.OnlineUsers}))},b}(React.Component);ReactDOM.render(React.createElement(AdminIoCommanderPanel,null),document.getElementById('AdminIoCommander'));