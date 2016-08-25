# buggoo_light
# 适用于H5页面的，更加轻量的bugoo

((WIN, DOC) ->

  "use strict"

  noop = ->

  elBody = DOC.body or DOC.getElementsByTagName("html")[0]

  bind = (el, evt, callback) ->
    el.addEventListener evt, callback, no

  # Bugoo Class
  class Bugoo

    elAudio = DOC.createElement("audio")

    constructor: (@config) ->

      @currentTime = 0
      @status = "ready"
      @media = config.media


      @startFn = config.start or noop
      @loadingFn = config.loading or noop
      @timeupdateFn = config.timeupdate or noop
      @endFn = config.end or config.stop or noop
      @pauseFn = config.pause or noop

    play: ->
      elAudio.play()

      @

    pause: ->
      elAudio.pause()
      @status = "paused"

      @

    stop: ->
      @pause()

    end: ->
      elAudio.src = elAudio.currentSrc
      @status = "ended"
      @endFn()

      @

    init: ->
      elAudio.src = @media if @status isnt "paused"
      console.log(elAudio)
      bind elAudio, "play", =>
        @startFn()

      bind elAudio, "playing", =>
        @status = "playing"

      bind elAudio, "waiting", => 
        @status = "loading"
        @loadingFn()

      bind elAudio, "ended", =>
        @end()
        @status = "ended"

      bind elAudio, "timeupdate", =>
        @currentTime = elAudio.currentTime
        @duration = elAudio.duration
        @timeupdateFn()

      @


  entry = (config) ->
    (new Bugoo(config)).init()

  if typeof exports isnt "undefined" and module.exports
    module.exports = exports = entry
  else if typeof define is "function"
    define "binnng/bugoo", (require, exports, module) ->
      module.exports = exports = entry
  else if typeof angular is "object"
    angular.module("binnng/bugoo", []).factory "$bugoo", -> entry
  else
    WIN["Bugoo"] = entry

) window, document