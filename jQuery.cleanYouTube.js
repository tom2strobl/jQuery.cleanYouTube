(function($) {
  $.fn.cleanYouTube = function(options) {

	// plugin defaults
    $.fn.cleanYouTube.defaults = {
    	'videoid' : 'c1PbjssaNAg',
    	'autoplay' : false,
    	'loop' : false
    };

    // build main options before element iteration by extending the default ones
    var settings = $.extend({}, $.fn.cleanYouTube.defaults, options);

    var player;
    var html =
    	'<div id="youTubeVideo">' +
	    	'<div id="player"></div>' +
				'<div id="youTubeControls">' +
		    	'<a href="#" id="videoPlay"></a>' +
					'<a href="#" id="videoPause"></a>' +
					'<span id="videotime">00:00</span>' +
					'<input id="videoProgress" type="range" value="0" />' +
					'<div id="videoProgressFill"></div>' +
					'<span id="videoduration">00:00</span>' +
					'<a href="#" id="videoMute"></a>' +
					'<a href="#" id="videoUnmute"></a>' +
					'<input id="videoVolume" type="range" min="0" max="100" value="100" />' +
					'<a href="#" id="videoFullscreen"></a>' +
				'</div>' +
			'</div>';
    this.append(html);

    // init YouTube API
    var iframeScriptInited;
    if(!iframeScriptInited){
			// write the api script tag
			var tag = document.createElement('script');
			tag.src = "http://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			iframeScriptInited = true;
		};
		
		// init the iframe player
		window.onYouTubePlayerAPIReady = function(){
			player = new YT.Player('player', {
				height: '740',
				width: '960',
				videoId: settings.videoid,
				playerVars: { 'html5': 1, 'modestbranding': 1, 'autoplay': 1, 'controls': 0, 'rel': 0, 'iv_load_policy': 3, 'wmode': 'transparent', 'hd': 1, 'showinfo': 0 },
				events: {
					'onStateChange': stateChanger,
					'onError': onPlayerError
				}
			});
		};
		function onPlayerError(event) { document.location = ""; } var done = false;

		// kill them red play buttons! Basically autoplay + pause and seek back without sounds
		var firstPlay = 0;
		var stateChanger = function stateChanger(state) {
			setInterval(updateytplayerInfo, 250);
			updateytplayerInfo();

			if(state.data === -1){
				player.mute();
			}else if(state.data === 1){
				if(firstPlay == 0){
					if(settings.autoplay == false){
						player.pauseVideo();
					}
					player.unMute();
					player.seekTo(0);
					firstPlay++;
				}else{
					$('#videoPlay').hide();
					$('#videoPause').show();
				}
			}else if(state.data === 2){
				$('#videoPause').hide();
				$('#videoPlay').show();
			}
			// avoid them red buttons once again!
			if(state.data == YT.PlayerState.ENDED){ 
				player.unMute();
				player.seekTo(0);
				if(settings.loop == false){
					player.stopVideo();
				}
      } 
		}

	// helperfunction for calculations
    function pad2(number) {
      parseInt(number);
      return (number < 10 ? '0' : '') + number
    }

    // gets called every 250ms to update progressbar and numbers
	function updateytplayerInfo() {
	    var vid_duration = player.getDuration().toFixed();
	    var vid_mins = Math.floor(vid_duration/60);
	    var vid_seconds = vid_duration%60;
	    $("#videoduration").html(pad2(vid_mins.toFixed().toString())+":"+pad2(vid_seconds.toString()));
	    var vid_ctime = player.getCurrentTime().toFixed();
	    var vid_cmins = Math.floor(vid_ctime/60);
	    var vid_cseconds = vid_ctime%60;
	    $("#videotime").html(pad2(vid_cmins.toFixed().toString())+":"+pad2(vid_cseconds.toString()));
	    var val = player.getCurrentTime();
	    var val2 = player.getDuration();
	    var val3 = val/val2*100;
	    $('#videoProgress').val(val3);
	    var maxw = $('#videoProgress').width();
		var newwidth = maxw * val3 / 100 + 3;
		$('#videoProgressFill').width(newwidth);
    }

    // fullscreen api
		(function() {
		var fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() {},
			requestFullScreen: function() {},
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		}, browserPrefixes = 'webkit moz o ms khtml'.split(' ');
		// check for native support
		if (typeof document.cancelFullScreen != 'undefined') {
		    fullScreenApi.supportsFullScreen = true;
		} else {
		    // check for fullscreen support by vendor prefix
		    for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
		        fullScreenApi.prefix = browserPrefixes[i];
		        if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
		            fullScreenApi.supportsFullScreen = true;
		            break;
		        }
		    }
		}
		// update methods to do something useful
		if (fullScreenApi.supportsFullScreen) {
		    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		    fullScreenApi.isFullScreen = function() {
		       switch (this.prefix) {
		            case '':
		                return document.fullScreen;
		            case 'webkit':
		                return document.webkitIsFullScreen;
		            default:
		                return document[this.prefix + 'FullScreen'];
		        }
		    }
		    fullScreenApi.requestFullScreen = function(el) {
		        return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		    }
		    fullScreenApi.cancelFullScreen = function(el) {
		        return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		    }
		}
		// jQuery plugin
		if (typeof jQuery != 'undefined') {
		    jQuery.fn.requestFullScreen = function() {
		        return this.each(function() {
		            if (fullScreenApi.supportsFullScreen) {
		                fullScreenApi.requestFullScreen(this);
		            }
		        });
		    };
		}
		// export api
		window.fullScreenApi = fullScreenApi;
		})();

    // if browser doesnt support fullscreen, get rid of that darn button
		if(!fullScreenApi.supportsFullScreen) {
			$('#videoFullscreen').remove();
		}
		// get fullscreenshizzle goin
		$('#videoFullscreen').click(function() {	
			$('#' + player.a.id).requestFullScreen();
		});

		// controls bindings
		$('#videoPlay').on('click',function(e){
			player.playVideo();
			$('#videoPlay').hide();
			$('#videoPause').show();
			return false;
		});
		$('#videoPause').on('click',function(e){
			player.pauseVideo();
			$('#videoPause').hide();
			$('#videoPlay').show();
			return false;
		});
		$('#videoMute').on('click',function(e){
			player.mute();
			$('#videoMute').hide();
			$('#videoUnmute').show();
			return false;
		});
		$('#videoUnmute').on('click',function(e){
			player.unMute();
			$('#videoUnmute').hide();
			$('#videoMute').show();
			return false;
		});
		$('#videoVolume').on('change', function(e){
			var newvolume = $('#videoVolume').val();
			player.setVolume(newvolume);
		});
		$('#videoProgress').on('mousedown',function(e){
			player.pauseVideo();
		});
		$('#videoProgress').on('mouseup',function(e){
			player.playVideo();
		});
		$('#videoProgress').on('change',function(e){
			var progress = $('#videoProgress').val();
			var val2 = player.getDuration();
			var newvar = val2/(100/progress);
			player.seekTo(newvar);
			var maxw = $('#videoProgress').width();
			var newwidth = maxw * progress / 100;
			$('#videoProgressFill').width(newwidth);
		});

  };
})(jQuery);