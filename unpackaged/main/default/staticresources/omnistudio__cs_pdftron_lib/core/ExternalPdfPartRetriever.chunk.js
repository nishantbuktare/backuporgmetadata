/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[5],{570:function(xa,ta,h){h.r(ta);var ra=h(0);xa=h(55);var na=h(209),pa=h(486),ja=h(265),ka=window;h=function(){function ea(y,z){this.a7=function(r){r=r.split(".");return r[r.length-1].match(/(jpg|jpeg|png|gif)$/i)};z=z||{};this.url=y;this.filename=z.filename||y;this.Bf=z.customHeaders;this.QIa=!!z.useDownloader;this.withCredentials=!!z.withCredentials}ea.prototype.TL=function(y){this.Bf=y};ea.prototype.getCustomHeaders=function(){return this.Bf};
ea.prototype.getFileData=function(y){var z=this,r=this,n=new XMLHttpRequest,f=0===this.url.indexOf("blob:")?"blob":"arraybuffer";n.open("GET",this.url,!0);n.withCredentials=this.withCredentials;n.responseType=f;this.Bf&&Object.keys(this.Bf).forEach(function(a){n.setRequestHeader(a,z.Bf[a])});var b=/^https?:/i.test(this.url);n.addEventListener("load",function(a){return Object(ra.b)(this,void 0,void 0,function(){var e,w,aa,ba,ha,x;return Object(ra.d)(this,function(ca){switch(ca.label){case 0:if(200!==
this.status&&(b||0!==this.status))return[3,10];r.trigger(ea.Events.DOCUMENT_LOADING_PROGRESS,[a.loaded,a.loaded]);if("blob"!==this.responseType)return[3,4];e=this.response;return r.a7(r.filename)?[4,Object(ja.b)(e)]:[3,2];case 1:return w=ca.aa(),r.fileSize=w.byteLength,y(new Uint8Array(w)),[3,3];case 2:aa=new FileReader,aa.onload=function(fa){fa=new Uint8Array(fa.target.result);r.fileSize=fa.length;y(fa)},aa.readAsArrayBuffer(e),ca.label=3;case 3:return[3,9];case 4:ca.zd.push([4,8,,9]);ba=new Uint8Array(this.response);
if(!r.a7(r.filename))return[3,6];e=new Blob([ba.buffer]);return[4,Object(ja.b)(e)];case 5:return w=ca.aa(),r.fileSize=w.byteLength,y(new Uint8Array(w)),[3,7];case 6:r.fileSize=ba.length,y(ba),ca.label=7;case 7:return[3,9];case 8:return ca.aa(),r.trigger(ea.Events.ERROR,["pdfLoad","Out of memory"]),[3,9];case 9:return[3,11];case 10:ha=a.currentTarget,x=Object(na.b)(ha),r.trigger(ea.Events.ERROR,["pdfLoad",this.status+" "+ha.statusText,x]),ca.label=11;case 11:return r.oF=null,[2]}})})},!1);n.onprogress=
function(a){r.trigger(ea.Events.DOCUMENT_LOADING_PROGRESS,[a.loaded,0<a.total?a.total:0])};n.addEventListener("error",function(){r.trigger(ea.Events.ERROR,["pdfLoad","Network failure"]);r.oF=null},!1);n.send();this.oF=n};ea.prototype.getFile=function(){var y=this;return new Promise(function(z){ka.da.isJSWorker&&z(y.url);if(y.QIa){var r=Object(ra.a)({url:y.url},y.Bf?{customHeaders:y.Bf}:{});z(r)}z(null)})};ea.prototype.abort=function(){this.oF&&(this.oF.abort(),this.oF=null)};ea.Events={DOCUMENT_LOADING_PROGRESS:"documentLoadingProgress",
ERROR:"error"};return ea}();Object(xa.a)(h);Object(pa.a)(h);Object(pa.b)(h);ta["default"]=h}}]);}).call(this || window)
