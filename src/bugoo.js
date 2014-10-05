// ```
// Bugoo.js
// 音频插件，支持pc和手持设备
// 一个页面只允许一个音频
// author: imbinnng@gmail.com
// ```

var Bugoo = function(WIN, DOC, undefined) {

  'use strict'

  var body = DOC.body || DOC.getElementsByTagName('html')[0],
    audio = DOC.createElement('audio'),
    canPlayMp3 = !!(audio.canPlayType && audio.canPlayType('audio/mpeg')),

    bugooFlashElement,
    flashHTML,
    flashSwfFile,
    flashAudioUrl,
    flashTimer,
    getFlashTime,

    //
    // 是否兼容Flash
    // 同样是供压缩器使用，可以在外部定义
    // @type {Boolean}
    //
    IS_USE_FLASH = true,

    //
    // 是不是使用H5播放器
    // 供压缩器使用
    // 如果定义了IS_USE_FLASH为false，压缩器会过滤掉所有Flash相关代码
    // @type {Boolean}
    //
    isH5Player = true,
    bugooUniqueInstance = null,
    noop = function() {};

  if (!canPlayMp3 && !IS_USE_FLASH) {
    return console.log('oh, I cant play in so low browser!');
  }

  if (IS_USE_FLASH && !canPlayMp3) {

    // flash Object对象的方法
    getFlashTime = function() {

      var flashObj = WIN['bugooFlash'] || DOC['bugooFlash'],
        time = 0;

      if (flashObj && (flashObj.getTime || (flashObj = flashObj[1]) && flashObj.getTime)) {
        time = flashObj.getTime();
        if (isNaN(time)) {
          time = 0;
        }
      }

      return time;
    };

    audio = null;
    isH5Player = false;

    bugooFlashElement = DOC.createElement('div');
    flashHTML = ['<object id="bugooFlash" name="bugooFlash" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" >', '<param name="allowScriptAccess" value="always" /><param name="movie" value="', flashSwfFile, '?audioUrl=', flashAudioUrl, '" /><param name="quality" value="high" />', '<embed id="bugooFlash" name="bugooFlash" src="', flashSwfFile, '?audioUrl=', flashAudioUrl, '" allowScriptAccess="sameDomain" allowFullScreen="true" FlashVars="" quality="high" width="1" height="1" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>'];
    bugooFlashElement.setAttribute('style', "height:0;overflow:hidden");

    body.appendChild(bugooFlashElement);

  }

  var bugoo = function(conf) {

    this.media = conf.media;
    this.currentTime = 0;
    this.status = 'ready';
    this.startFn = conf.start || noop;
    this.loadingFn = conf.loading || noop;
    this.timeupdateFn = conf.timeupdate || noop;
    this.endFn = conf.end || conf.stop || noop;
    this.pauseFn = conf.pause || noop;

    if (IS_USE_FLASH) {
      this.swfFile = conf.swfFile;
    }

    bugooUniqueInstance ? bugooUniqueInstance.end() : bugooUniqueInstance = this;

  };

  bugoo.prototype.play = isH5Player ? function() {
    var that = this;

    if (that.status != 'paused') {
      audio.src = that.media;
    }

    audio.addEventListener('play', function() {
      that.startFn();
    });
    audio.addEventListener('playing', function() {
      that.status = 'playing';
    });
    audio.addEventListener('waiting', function() {
      that.status = 'loading';
      that.loadingFn();
    });

    audio.addEventListener('ended', function() {
      that.end();
      that.status = 'ended';
    });

    audio.addEventListener('timeupdate', function() {
      that.currentTime = audio.currentTime;
      that.duration = audio.duration;
      that.timeupdateFn();
    });

    audio.play();

    return that;
  } : function() {
    var that = this;

    flashSwfFile = that.swfFile;
    flashAudioUrl = that.media;
    bugooFlashElement.innerHTML = flashHTML.join('');

    flashTimer = setInterval(function() {
      if (0 === getFlashTime() || isNaN(getFlashTime())) {
        that.status = 'loading';
        that.loadingFn();
      } else {
        that.startFn && that.startFn();
        delete that.startFn;
        that.status = 'playing';
        that.timeupdateFn();
      }

      if (getFlashTime() === 100) {
        that.end();
      }

      that.currentTime = getFlashTime() * that.duration / 100;
    }, 30);

    return that;
  };

  bugoo.prototype.end = function() {

    if (isH5Player) {
      audio.src = audio.currentSrc;
    } else {
      bugooFlashElement.innerHTML = '';
      clearInterval(flashTimer);
    }

    this.status = 'ended';
    this.endFn();

    return this;
  };

  bugoo.prototype.pause = function() {

    if (isH5Player) {
      audio.pause();
      this.status = 'paused';
    } else {
      this.end();
      this.status = 'ended';
    }

    this.pauseFn();

    return this;

  };

  return bugoo;

}(window, document);