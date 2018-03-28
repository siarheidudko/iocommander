'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a},serverStorage=Redux.createStore(editServerStore),connectionStorage=Redux.createStore(editConnStore),adminpanelStorage=Redux.createStore(editAdmpanelStore,window.__REDUX_DEVTOOLS_EXTENSION__&&window.__REDUX_DEVTOOLS_EXTENSION__());function editServerStore(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{users:{},admins:{},tasks:{}},f=arguments[1];try{switch(f.type){case'SYNC_OBJECT':var a=f.payload;return a;break;case'CLEAR_STORAGE':var a={users:{},admins:{},tasks:{}};return a;break;default:}}catch(g){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430:'+g),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 serverStorage:'+g}})}return b}function editConnStore(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{uids:{},users:{},report:{},groups:{},fileport:''},f=arguments[1];try{switch(f.type){case'SYNC_OBJECT':var a=f.payload;return a;break;case'CLEAR_STORAGE':var a={uids:{},users:{}};return a;break;default:}}catch(g){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439:'+g),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 connectionStorage:'+g}})}return b}function editAdmpanelStore(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{auth:!1,popuptext:'',session:{}},f=arguments[1];try{switch(f.type){case'AUTH':var a=_.clone(b);return a.auth=f.payload.auth,a.session={},!1===f.payload.auth?(a.popuptext='\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430!',a.session.login='',a.session.password=''):(a.session.login=f.payload.login,a.session.password=f.payload.pass),a;break;case'MSG_POPUP':var a=_.clone(b);return a.popuptext=f.payload.popuptext,a;break;default:}}catch(g){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0430\u0434\u043C\u0438\u043D\u043F\u0430\u043D\u0435\u043B\u0438:'+g),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 adminpanelStorage:'+g}})}return b}function login(a,b,f){try{'object'===('undefined'==typeof a?'undefined':_typeof(a))&&a.emit('login',{user:b,password:f})}catch(g){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u0432 \u0441\u043E\u043A\u0435\u0442\u0435:'+g),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u0432 \u0441\u043E\u043A\u0435\u0442\u0435:'+g}})}}function datetime(){try{var a=new Date;return'['+a.getDate()+'.'+(a.getMonth()+1)+'.'+a.getFullYear()+' - '+a.getHours()+'.'+a.getMinutes()+'.'+a.getSeconds()+'] '}catch(b){console.log('\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0441 \u0444\u0443\u043D\u043A\u0446\u0438\u0435\u0439 datetime()!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0441 \u0444\u0443\u043D\u043A\u0446\u0438\u0435\u0439 datetime()!'}})}}function timeStamp(a){try{var b;return b=9<a.getDate()?a.getDate()+'.':'0'+a.getDate()+'.',b=9<a.getMonth()+1?b+(a.getMonth()+1)+'.'+a.getFullYear()+' ':b+'0'+(a.getMonth()+1)+'.'+a.getFullYear()+' ',b=9<a.getHours()?b+a.getHours()+':':b+'0'+a.getHours()+':',b=9<a.getMinutes()?b+a.getMinutes()+':':b+'0'+a.getMinutes()+':',9<a.getSeconds()?b+=a.getSeconds():b=b+'0'+a.getSeconds(),b}catch(f){return'00.00.0000 00:00:00'}}function generateUID(){try{var a=new Date().getTime();return'undefined'!=typeof performance&&'function'==typeof performance.now&&(a+=performance.now()),'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(b){var f=0|(a+16*Math.random())%16;return a=Math.floor(a/16),('x'===b?f:8|3&f).toString(16)})}catch(b){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 uid!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 uid!'}})}}function listenSocket(a){try{a.on('sendServerStorageToAdmin',function(b){try{serverStorage.dispatch({type:'SYNC_OBJECT',payload:b})}catch(f){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0434\u0430\u043D\u043D\u044B\u0445: '+f),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0434\u0430\u043D\u043D\u044B\u0445: '+f}})}}),a.on('sendConnStorageToAdmin',function(b){try{connectionStorage.dispatch({type:'SYNC_OBJECT',payload:b})}catch(f){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439: '+f),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439: '+f}})}}),a.on('disconnect',function(){try{serverStorage.dispatch({type:'CLEAR_STORAGE'}),connectionStorage.dispatch({type:'CLEAR_STORAGE'}),console.log(datetime()+'\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0440\u0430\u0437\u043E\u0440\u0432\u0430\u043D\u043E!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0440\u0430\u0437\u043E\u0440\u0432\u0430\u043D\u043E!'}})}catch(b){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0447\u0438\u0441\u0442\u043A\u0438 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449, \u043F\u0440\u0438 \u0440\u0430\u0437\u0440\u044B\u0432\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F: '+b)}})}catch(b){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0441\u043B\u0443\u0448\u0438\u0432\u0430\u043D\u0438\u044F \u0441\u043E\u043A\u0435\u0442\u0430: '+b),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0441\u043B\u0443\u0448\u0438\u0432\u0430\u043D\u0438\u044F \u0441\u043E\u043A\u0435\u0442\u0430: '+b}})}}function initialiseSocket(a,b){try{var f='{"protocol":"'+window.location.protocol.substr(0,window.location.protocol.length-1)+'","server":"'+window.location.hostname+'","port":"444","login":"'+a+'","password":"'+b+'"}',g;try{g=JSON.parse(f)}catch(o){console.log(datetime()+'\u041D\u0435 \u043C\u043E\u0433\u0443 \u0440\u0430\u0441\u043F\u0430\u0440\u0441\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435 \u043C\u043E\u0433\u0443 \u0440\u0430\u0441\u043F\u0430\u0440\u0441\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438!'}})}if('object'===('undefined'==typeof g?'undefined':_typeof(g))){var h=g.login,j=CryptoJS.SHA256(h+g.password+'icommander').toString(),k=g.protocol,l=g.server,m=g.port,n=io(k+'://'+l+':'+m);window.socket=n,'undefined'!=typeof n&&(n.on('connect',function(){console.log(datetime()+'\u0421\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E!')}),n.on('initialize',function(o){'whois'===o.value&&login(n,h,j)}),n.on('authorisation',function(o){'true'===o.value?(console.log(datetime()+'\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430!'),adminpanelStorage.dispatch({type:'AUTH',payload:{auth:!0,login:a,pass:j}})):(serverStorage.dispatch({type:'CLEAR_STORAGE'}),connectionStorage.dispatch({type:'CLEAR_STORAGE'}),console.log(datetime()+'\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u0435 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430!'),n.disconnect(),adminpanelStorage.dispatch({type:'AUTH',payload:{auth:!1}}))}),listenSocket(n))}else console.log(datetime()+'\u041D\u0435 \u043C\u043E\u0433\u0443 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041D\u0435 \u043C\u043E\u0433\u0443 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438!'}})}catch(o){console.log(datetime()+'\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u0430!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u043A\u043B\u0438\u0435\u043D\u0442\u0430!'}})}}function replacer(a,b){try{return _typeof('string'===a)?b?a.replace(/\./gi,'_'):a.replace(/\_/gi,'.'):'(\u043D\u0435 \u043C\u043E\u0433\u0443 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u044C, \u0442.\u043A. \u0442\u0438\u043F \u0432\u0445\u043E\u0434\u044F\u0449\u0435\u0433\u043E \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u0430 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0441\u0442\u0440\u043E\u043A\u043E\u0432\u044B\u043C)'}catch(f){console.log(datetime()+'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0438\u043C\u0435\u043D\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:'\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0438\u043C\u0435\u043D\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F!'}})}}function SendFileToInternalFS(a,b,f,g,h,j,k,l){var m=new Promise(function(n){var o=new FormData;o.append(b,a[0]);var p=new XMLHttpRequest;p.onreadystatechange=function(){4==this.readyState&&200==this.status?n(this.responseText):4==this.readyState&&('string'==typeof this.responseText?n(this.responseText):n('unidentified error'))};var q=window.location.protocol.substr(0,window.location.protocol.length-1)+'://'+window.location.hostname+':'+window.location.port+'/upload';p.open('POST',q,!0),p.setRequestHeader('Authorization','Basic '+btoa(adminpanelStorage.getState().session.login+':'+adminpanelStorage.getState().session.password)),p.send(o)});m.then(function(n){if('upload'===n)for(var s,o=window.location.protocol.substr(0,window.location.protocol.length-1)+'://'+window.location.hostname+':'+connectionStorage.getState().fileport+'/'+b,p={uid:b,task:{nameTask:'getFileFromWWW',extLink:o,intLink:f,fileName:a[0].name,exec:'false',complete:'false',answer:'',platform:g,dependencies:h,comment:j,timeoncompl:k.getTime()}},q=0;q<l.length;q++)s=[l[q],p],window.socket.emit('adm_setTask',s);else console.log(datetime()+'\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0444\u0430\u0439\u043B\u0430 \u043D\u0430 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440!'),adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:n}})},function(n){adminpanelStorage.dispatch({type:'MSG_POPUP',payload:{popuptext:n}})})}