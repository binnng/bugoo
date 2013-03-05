/*
 *音频插件，支持pc和手持设备
 *@time 2013/3/2
 *@demo 
 *var audio = new Bugoo({
 *  media: 'a.mp3',
 *  swfFile: 'a/swf/player.swf',
 *  duration: 280,
 *  start: function() {},
 *  loading: function() {},
 *  stop: function() {}
 *});
 */

var Bugoo = Bugoo || function(window, undefined) {

	//是否支持Flash
	function hasFlash() {
		var bool = false;
		if(navigator.plugins && navigator.plugins.length){
			var l = navigator.plugins.length;
		  	while(l--){
		   		if(navigator.plugins[l].name.indexOf('Shockwave Flash')!=-1){
		    		bool=true;
		    		break;
		    	}
		 	}
		}else if(window.ActiveXObject){
		  for (var i=10;i>=2;i--){
		    try{   
		      var t=eval("new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + i + "');");
		      if(t){
		      	bool=true;
		      	break;
		      }
		    }
		    catch(e) {}
		  }
		}
		return bool;
	}

	//flash Object对象的方法，注册到window
	window.getTime = function () {
		var flashObj = window['mkk'] || document['mkk'],
		time = 0;

		if (flashObj && (flashObj.getTime || (flashObj = flashObj[1]) && flashObj.getTime)) {
			time = flashObj.getTime();
			if (isNaN(time)) {
				time = 0;
			}
		}
		
		return time;
	}

	var body = document.body || document.getElementsByTagName('html')[0],

		audio = document.createElement('audio'),

		//是否可以播放mp3
		canPlayMp3 = !! ( audio.canPlayType && audio.canPlayType('audio/mp3') ),

		//放置flash代码的元素
		bugooFlashElement,
		flashHTML,
		timer,

		//空函数，省去判断函数有没有再去执行的判断
		emptyFn = function(){};

	if ( !canPlayMp3 ) {

		audio = undefined;

		bugooFlashElement = document.createElement('div');
		flashHTML = '<object id="mkk" name="mkk" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" ><param name="allowScriptAccess" value="always" /><param name="movie" value="{swfFile}?audioUrl={audioUrl}" /><param name="quality" value="high" /><embed id="mkk" name="mkk" src="{swfFile}?audioUrl={audioUrl}" allowScriptAccess="sameDomain" allowFullScreen="true"  FlashVars=""  quality="high"  width="1"  height="1"  align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>';				
		bugooFlashElement.setAttribute('style', "height:0;overflow:hidden");

		body.appendChild(bugooFlashElement);

	} else {
		delete bugooFlashElement;
		delete flashHTML;
	}

	var bugoo = function(conf) {

		this.media        = conf.media;
		this.swfFile      = conf.swfFile;
		this.currentTime  = 0;
		this.status       = 'ready';
		this.duration     = conf.duration   || 0;
		this.startFn      = conf.start      || emptyFn;
		this.loadingFn    = conf.loading    || emptyFn;
		this.timeupdateFn = conf.timeupdate || emptyFn;
		this.stopFn       = conf.stop       || emptyFn;

		//一个页面只有一个实例
		if ( 'bugooUniqueInstance' in window ) {
			window.bugooUniqueInstance.stop();
		} else {
			window.bugooUniqueInstance = this;
		}

	};

	bugoo.prototype.play = function() {
		var that = this;

		if (audio) {
			audio.src = that.media;
			audio.play();

			audio.addEventListener('play', that.startFn);
			audio.addEventListener('playing', function() {
				that.status = 'playing';
			});
			audio.addEventListener('waiting', function() {
				that.status = 'loading';
				that.loadingFn();
			});
			/*
			 *不能这么写
			 *audio.addEventListener('ended',that.stop);
			 *这样会改变stop里的this指向
			 */
			audio.addEventListener('ended', function() {
				that.stop();
			});

			timer = setInterval(function() {

				that.currentTime = audio.currentTime;

				that.timeupdateFn();

			}, 30);
		} else {

			bugooFlashElement.innerHTML = flashHTML.replace(/{swfFile}/g, that.swfFile).replace(/{audioUrl}/g, that.media);
			timer = setInterval(function() {

				if ( 0 === getTime() || NaN === getTime() ) {
					that.status = 'loading';
					that.loadingFn();
				} else {
					that.startFn && that.startFn();
					//startFn 只触发一次
					delete that.startFn;
					that.status = 'playing';
					that.timeupdateFn();
				}					

				if(getTime() === 100) {
					that.stop();
				}

				that.currentTime = getTime() * that.duration / 100;

			}, 30);
		}

		return that;
	};

	bugoo.prototype.stop = function() {
		var that = this;

		if (audio) {
			audio.src = audio.currentSrc;
		} else {
			bugooFlashElement.innerHTML = '';
		}

		clearInterval(timer);

		that.status = 'stoped';

		that.stopFn();

		return that;
	};

	return bugoo;

}(this);