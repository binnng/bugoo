/*
 *音频插件，支持pc和手持设备
 *@time 2013/3/2
 *@author binnng
 *@update 2013/3/26 更改了swf文件，重新组织了flash播放的代码
 */

var Bugoo = Bugoo || function(window, document, undefined) {

	"use strict";

	var body = document.body || document.getElementsByTagName('html')[0],

		audio = document.createElement('audio'),

		//是否可以播放mp3
		canPlayMp3 = !! ( audio.canPlayType && audio.canPlayType('audio/mpeg') ),

		timer,

		//空函数，省去判断函数有没有再去执行的判断
		emptyFn = function(){};

	if ( !canPlayMp3 ) {
		
		audio = undefined;

		//放置flash代码的元素
		var bugooFlashElement = document.createElement('div'),
			bugooFlashHTML = '<object id="mkk" name="mkk" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" ><param name="allowScriptAccess" value="always" /><param name="movie" value="{swfFile}?audioUrl={audioUrl}" /><param name="quality" value="high" /><embed id="mkk" name="mkk" src="{swfFile}?audioUrl={audioUrl}" allowScriptAccess="sameDomain" allowFullScreen="true"  FlashVars=""  quality="high"  width="1"  height="1"  align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>';
		
		bugooFlashElement.setAttribute('style', "height:0;overflow:hidden");

		body.appendChild(bugooFlashElement);

		//flash Object对象的方法
		var getTime = function () {
			return window.bugooFlashObj.getTime();
		}

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
	};

	bugoo.prototype.play = audio ? function() {
		var that = this;
		/**重新定义audio
		 *1）快速解绑事件
		 *2）低端安卓机创建一个audio元素后，即使修改了src，但播放的音频也不会修改
		*/
		audio = document.createElement('audio');
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

		return that;
	} : function() {
		var that = this;

		bugooFlashElement.innerHTML = bugooFlashHTML.replace(/{swfFile}/g, that.swfFile).replace(/{audioUrl}/g, that.media);
	
		window.bugooFlashObj = (function() {
			var flashObj = window.mkk || document.mkk;

			flashObj.getTime || (flashObj = flashObj[1]);

			return flashObj;
		})();

		timer = setInterval(function() {

			if ( !getTime() ) {
				that.status = 'loading';
				that.loadingFn();
			} else {
				that.startFn && that.startFn();
				//startFn 只触发一次
				that.startFn = undefined;
				that.status = 'playing';
				that.timeupdateFn();
			}					

			if(getTime() === 100) {
				that.stop();
			}

			that.currentTime = getTime() * that.duration / 100;

		}, 30);

		return that;
	};


	bugoo.prototype.stop = function() {
		var that = this;

		if (audio) {
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
			bugooFlashElement.innerHTML = '';
		}

		clearInterval(timer);

		that.status = 'stoped';

		that.stopFn();

		return that;
	};

	return bugoo;

}(this, document);
