var Bugoo=function(e,t,a){"use strict";var i=t.body||t.getElementsByTagName("html")[0],n=t.createElement("audio"),s=!!(n.canPlayType&&n.canPlayType("audio/mpeg")),o,r,l,u,d,c,h=true,p=true,m=null,f=function(){};if(!s&&!h){return console.log("oh, I cant play in so low browser!")}if(h&&!s){c=function(){var a=e["bugooFlash"]||t["bugooFlash"],i=0;if(a&&(a.getTime||(a=a[1])&&a.getTime)){i=a.getTime();if(isNaN(i)){i=0}}return i};n=null;p=false;o=t.createElement("div");r=['<object id="bugooFlash" name="bugooFlash" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" >','<param name="allowScriptAccess" value="always" /><param name="movie" value="',l,"?audioUrl=",u,'" /><param name="quality" value="high" />','<embed id="bugooFlash" name="bugooFlash" src="',l,"?audioUrl=",u,'" allowScriptAccess="sameDomain" allowFullScreen="true" FlashVars="" quality="high" width="1" height="1" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>'];o.setAttribute("style","height:0;overflow:hidden");i.appendChild(o)}var g=function(e){this.media=e.media;this.currentTime=0;this.status="ready";this.startFn=e.start||f;this.loadingFn=e.loading||f;this.timeupdateFn=e.timeupdate||f;this.endFn=e.end||e.stop||f;this.pauseFn=e.pause||f;if(h){this.swfFile=e.swfFile}m?m.end():m=this};g.prototype.play=p?function(){var e=this;if(e.status!="paused"){n.src=e.media}n.addEventListener("play",function(){e.startFn()});n.addEventListener("playing",function(){e.status="playing"});n.addEventListener("waiting",function(){e.status="loading";e.loadingFn()});n.addEventListener("ended",function(){e.end();e.status="ended"});n.addEventListener("timeupdate",function(){e.currentTime=n.currentTime;e.duration=n.duration;e.timeupdateFn()});n.play();return e}:function(){var e=this;l=e.swfFile;u=e.media;o.innerHTML=r.join("");d=setInterval(function(){if(0===c()||isNaN(c())){e.status="loading";e.loadingFn()}else{e.startFn&&e.startFn();delete e.startFn;e.status="playing";e.timeupdateFn()}if(c()===100){e.end()}e.currentTime=c()*e.duration/100},30);return e};g.prototype.end=function(){if(p){n.src=n.currentSrc}else{o.innerHTML="";clearInterval(d)}this.status="ended";this.endFn();return this};g.prototype.pause=function(){if(p){n.pause();this.status="paused"}else{this.end();this.status="ended"}this.pauseFn();return this};return g}(window,document);