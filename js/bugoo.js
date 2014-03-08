/*
 *音频插件，支持pc和手持设备，一个页面只允许一个音频
 *@time 2013/30/02
 *@update 2014/03/08
 *@demo
 *var audio = new Bugoo({
 *  media: 'a.mp3',
 *  swfPath: 'a/swf/player.swf',
 *  duration: 280,
 *  start: function() {},
 *  loading: function() {},
 *  end: function() {}
 *});
 */

var Bugoo = function(WIN, DOC, undefined) {

  /* flash Object对象的方法，需要注册到window */
  var getTime = function() {

    var flashObj = WIN['mkk'] || DOC['mkk'],
    time = 0;

    if (flashObj && (flashObj.getTime || (flashObj = flashObj[1]) && flashObj.getTime)) {
      time = flashObj.getTime();
      if (isNaN(time)) {
        time = 0;
      }
    }

    return time;
  };

  WIN['getTime'] = getTime;

  var body = DOC.body || DOC.getElementsByTagName('html')[0],
  audio = DOC.createElement('audio'),
  canPlayMp3 = !!(audio.canPlayType && audio.canPlayType('audio/mpeg')),
  bugooFlashElement,
  flashHTML,
  flashSwfFile,
  flashAudioUrl,
  timer,
  /**
  * 是不是使用H5播放器
  * 供压缩器使用
  * 如果定义了IS_USE_FLASH为false，压缩器会过滤掉所有Flash相关代码
  * @type {Boolean}
  */
  isH5Player = true,
  /**
  * 是否兼容Flash
  * 同样是供压缩器使用，可以在外部定义
  * @type {Boolean}
  */
  IS_USE_FLASH = true,
  emptyFn = function() {};

  if (!canPlayMp3 && !IS_USE_FLASH) {
    return console.log('oh, I cant play in so low browser!');
  }

  if (IS_USE_FLASH && !canPlayMp3) {

    audio = null;
    isH5Player = false;

    bugooFlashElement = DOC.createElement('div');
    flashHTML = ['<object id="mkk" name="mkk" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="1"  height="0" >', '<param name="allowScriptAccess" value="always" /><param name="movie" value="', flashSwfFile, '?audioUrl=', flashAudioUrl, '" /><param name="quality" value="high" />', '<embed id="mkk" name="mkk" src="', flashSwfFile, '?audioUrl=', flashAudioUrl, '" allowScriptAccess="sameDomain" allowFullScreen="true" FlashVars="" quality="high" width="1" height="1" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>'];
    bugooFlashElement.setAttribute('style', "height:0;overflow:hidden");

    body.appendChild(bugooFlashElement);

  }

  var bugoo = function(conf) {

    this.media = conf.media;
    this.swfFile = conf.swfFile;
    this.currentTime = 0;
    this.duration = conf.duration;
    this.status = 'ready';
    this.startFn = conf.start || emptyFn;
    this.loadingFn = conf.loading || emptyFn;
    this.timeupdateFn = conf.timeupdate || emptyFn;
    this.stopFn = conf.stop || emptyFn;
    this.pauseFn = conf.pause || emptyFn;

    if ('bugooUniqueInstance' in WIN) {
      WIN.bugooUniqueInstance.stop();
    } else {
      WIN.bugooUniqueInstance = this;
    }

  };

  bugoo.prototype.play = isH5Player ?
  function() {
    var that = this;

    if (that.status != 'paused') {
      audio.src = that.media;
    }

    audio.play();

    audio.addEventListener('play', that.startFn);
    audio.addEventListener('playing',
    function() {
      that.status = 'playing';
    });
    audio.addEventListener('waiting',
    function() {
      that.status = 'loading';
      that.loadingFn();
    });

    audio.addEventListener('ended',
    function() {
      that.stop();
    });

    timer = setInterval(function() {

      that.currentTime = audio.currentTime;
      that.timeupdateFn();

    },
    30);

    return that;
  }: function() {

    flashSwfFile = that.swfFile;
    flashAudioUrl = that.media;
    bugooFlashElement.innerHTML = flashHTML.join('');
    timer = setInterval(function() {

      if (0 === getTime() || isNaN(getTime())) {
        that.status = 'loading';
        that.loadingFn();
      } else {
        that.startFn && that.startFn();
        delete that.startFn;
        that.status = 'playing';
        that.timeupdateFn();
      }

      if (getTime() === 100) {
        that.stop();
      }

      that.currentTime = getTime() * that.duration / 100;

    },
    30);

    return that;
  };

  bugoo.prototype.stop = function() {
    var that = this;

    if (isH5Player) {
      audio.src = audio.currentSrc;
    } else {
      bugooFlashElement.innerHTML = '';
    }

    clearInterval(timer);

    that.status = 'stoped';

    that.stopFn();

    return that;
  };

  bugoo.prototype.pause = function() {
    var that = this;

    if (isH5Player) {
      audio.pause();
      that.status = 'paused';
    } else {
      that.stop();
      that.status = 'stoped';
    }

    that.pauseFn();

    return that;

  };

  return bugoo;

} (window, document);