## 描述
**bugoo.js** 是一个适用于pc和mobile浏览器的音频播放类库。

### 特性
* 暂且只支持mp3音频（其他音频也可放，但不保证质量）
* 支持HTML5的audio接口使用HTML5播放
* 一个页面不能同时播放两个音频
* 不依赖任何前端类库

### 浏览器支持
* ie6+ 及 各种现代浏览器
* 移动端浏览器

###Demo
[**bugoo.js**](http://laopopo.me/demo/bugoo/index.html)

## 文档

### 示例

```javascript
var sound = new Bugoo({
    media: 'sound.mp3', //音频文件的地址（必须）
    swfFile: 'player.swf', //flash文件的地址，不支持audio api的浏览器使用（必须）
    duration: 60, //音频的时长，以s为单位（必须）
    loading: function() {
      //加载时执行的方法
    },
    start: function() {
      //开始播放时执行的方法
    },
    timeupdate: function() {
      //播放过程中执行的方法
    },
    stop: function() {
      //停止时执行的方法
    }
});
```

##### 立即播放:
```javascript
var sound = new Bugoo({
    media: 'sound.mp3',
    swfFile: 'player.swf',
    duration: 60
}).play();
```

##### 播放
```javascript
sound.play();
```
##### 停止
```javascript
sound.stop();
```

### 属性
* **duration**: `Number` 音频的时长（以s为单位）
* **currentTime**: `Number` 当前播放的进度（以s为单位）
* **status**: `String` 播放的状态。有`ready`，`loading`，`playing`和`stoped`四个返回值。