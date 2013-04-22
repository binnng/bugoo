/*
 *音频插件，支持pc和手持设备
 *@time 2013/3/2
 *@author binnng
 *@update 2013/4/8 增加ended状态
 */

var Bugoo = Bugoo || function(window, document, undefined) {

	var body = document.body || document.getElementsByTagName('html')[0],

		audio = document.createElement('audio'),

		//是否可以播放mp3
		canPlayMp3 = !! ( audio.canPlayType && audio.canPlayType('audio/mpeg') ),

		//播放器的计时器
		timer,

		//flash音频播放当前进度
		curFlashProgress = 0,

		//空函数，省去判断函数有没有再去执行的判断
		emptyFn = function(){};

	if ( !canPlayMp3 ) {
		
		audio = undefined;

		//放置flash代码的元素
		var bugooFlashElement = document.createElement('div'),
			bugooFlashHTML = '<object id="mkk" name="mkk" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" ><param name="allowScriptAccess" value="always" /><param id="mkkp" name="movie" value="{mkkp}" /><param name="quality" value="high" /><embed id="mkkc" name="mkkc" src="" allowScriptAccess="sameDomain" allowFullScreen="true"  FlashVars=""  quality="high"  width="1"  height="1"  align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>';
		
		bugooFlashElement.setAttribute('style', "height:0;overflow:hidden");
		bugooFlashElement.innerHTML = bugooFlashHTML;

		body.appendChild(bugooFlashElement);

	}

	var bugoo = function(conf) {

		this.media        = conf.media;
		this.swfFile      = conf.swfFile;
		this.currentTime  = 0;
		this.duration     = conf.duration;
		this.status       = 'ready';
		this.volume       = conf.volume     || 0.6;
		this.startFn      = conf.start      || emptyFn;
		this.loadingFn    = conf.loading    || emptyFn;
		this.timeupdateFn = conf.timeupdate || emptyFn;
		this.stopFn       = conf.stop       || emptyFn;
	};

	bugoo.prototype.play = audio ? function() {

		var that = this;
		/**重新定义audio
		 *1）快速解绑事件
		 *2）低端安卓机创建一个audio元素后，即使修改了src，但播放的音频也不会修改
		*/		
		audio.pause();
		audio = document.createElement('audio');
		audio.src = that.media;

		audio.play();

		audio.addEventListener('playing', function() {
			that.status = 'playing';
			audio.volume = that.volume;
			that.startFn();
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

		return that;
	} : function() {
		var that = this,

		getTime = function() {
			var flashObj = window.mkk || document.mkk;

			if (!flashObj.getTime) {
				return;
			}

			flashObj.getTime || (flashObj = flashObj[1]);

			return flashObj.getTime();
		};

		document.all ? 
		bugooFlashElement.innerHTML = bugooFlashHTML.replace('{mkkp}', '/swf/player.swf?audioUrl=' + that.media) : 
		window.mkkc.src = '/swf/player.swf?audioUrl=' + that.media;

		timer = setInterval(function() {

			curFlashProgress = getTime();

			if ( !curFlashProgress ) {
				that.status = 'loading';
				that.loadingFn();
			} else {
				that.startFn && that.startFn();
				//startFn 只触发一次
				delete that.startFn;
				that.status = 'playing';
				that.timeupdateFn();
			}					

			if(curFlashProgress === 100) {
				that.stop();
			}

			that.currentTime = curFlashProgress * that.duration / 100;

		}, 30);

		return that;
	};


	bugoo.prototype.stop = function() {
		var that = this;

		if (audio) {

			if ( audio.ended ) {
				that.status = 'ended';
			} else {
				that.status = 'stoped';
			}
			/**
			 * 暂停并恢复从开始播放
			 */
			audio.pause();
			audio.currentTime = 0;
			/**
			 * 如果audio.currentTime = 0不起作用
			 * 更改src可以达到停止并恢复从0播放的效果
			 */
			if ( 0 !== audio.currentTime ) {
				audio.src = '';
			}
		} else {
			document.all ? bugooFlashElement.innerHTML = '' : window.mkkc.src = '';
			that.status = curFlashProgress === 100 ? 'ended' : 'stoped';

			curFlashProgress = 0;
		}

		clearInterval(timer);		

		that.stopFn();

		return that;
	};

	return bugoo;

}(this, document);
