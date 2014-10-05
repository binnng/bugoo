WIN = window
DOC = document

STATIC_PATH = "http://binnng.github.io/fm/statics/"
IMAGE_PATH = "images/"

$ = (id) -> document.getElementById(id)

getScript = (url, callback) ->
  head = DOC.getElementsByTagName('head')[0] or DOC.body
  script = DOC.createElement('script')
  done = no

  script.src = url

  script.onload = script.onreadystatechange = ->
    if !done and (!this.readyState or this.readyState isnt 'loading')
      done = yes
      callback.apply null if callback
      script.onload = script.onreadystatechange = null
      head.removeChild(script)

  head.appendChild(script);

pageHtml = [
  '<div id="view">',
    '<div id="canvas">',
      '<i id="progress"></i>',
      '<div id="player"></div>',
      '<img src="' + IMAGE_PATH + 'zSGhlXp4.gif" id="icon" />',      
    '</div>',
  '</div>',
].join('')

currentMusicOrder = 0
musicList = ['cover': "#{IMAGE_PATH}cover.jpg", 'url': "#{STATIC_PATH}xlaq.mp3"]

originMusicList = []

body = DOC.getElementsByTagName('body')[0]
body.innerHTML = pageHtml

progress = $('progress')
player = $('player')
icon = $('icon')

audio = ( ->

  _audio = -> 

  timer = 0
  bugoo = null

  onStart = ->
    player.className = 'rotate'
    icon.className = 'show'

  onLoading = ->

  onTimeupdate = -> 
    progress.style.width = this.currentTime / this.duration * 100 + '%'

  onEnd = ->
    progress.style.width = 0 + 'px'
    player.className = ''
    icon.className = ''

    if timer is 0
      timer = setTimeout -> 
        _audio.next() if 'ended' is _audio.status()
        timer = 0
      , 500

  onPause = ->
    progress.style.width = 0 + 'px'
    player.className = ''
    icon.className = ''

  setCover = ->
    cover = musicList[currentMusicOrder]['cover']
    player.setAttribute('style', 'background-image: url(' + cover + ');') if cover

  _audio.play = (isPaused) ->

    return bugoo.play() if isPaused

    bugoo = new Bugoo
      media: musicList[currentMusicOrder]['url'],
      # swfFile: "#{STATIC_PATH}bugoo.player.swf",
      # duration: 287, 
      start: onStart
      loading: onLoading
      timeupdate: onTimeupdate
      stop: onEnd
      pause: onPause

    setCover()

    bugoo.play()

  _audio.next = ->
    currentMusicOrder++
    currentMusicOrder = 0 if currentMusicOrder >= musicList.length
    _audio.play()

  _audio.prev = ->
    currentMusicOrder--
    currentMusicOrder = musicList.length - 1 if currentMusicOrder < 0
    _audio.play()    

  _audio.pause = -> bugoo.pause()
  _audio.status = -> bugoo.status

  _audio

)()

audio.play()

playOrPause = ->
  status = audio.status()
  if ( status is 'playing' or status is 'loading' ) then audio.pause() else audio.play(yes)

getScript "#{STATIC_PATH}playlist.js", ->
  playList = WIN['playList']

  for url in playList

    musicList.push
      cover: "",
      url: STATIC_PATH + url

  originMusicList = musicList.concat()
  originMusicList.shift()

player.onclick = playOrPause

DOC.onkeyup = (e)->
  e = e or WIN.event
  keyCode = e.keyCode
  
  playOrPause() if keyCode is 32 # blank
  audio.prev() if keyCode is 37 # left
  audio.next() if keyCode is 39 # right

  copy = originMusicList.concat()

  musicList = copy if keyCode is 65
  musicList = copy.reverse() if keyCode is 68
  ( musicList = copy.sort (a, b) -> Math.random() - 0.5 ) if keyCode is 83

WIN["console"]?.log? "随机s, 顺序a, 倒序d"  