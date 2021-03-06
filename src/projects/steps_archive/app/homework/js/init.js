// This file should facilitate UI and communication with the server

// When user clicks "check" or something to check the answer,
// this will ask the problem.js whether the question is right or wrong

// showing video (or at least opening the window)
// managing and displaying points

// custom make an alert, prompt, and confirm dialogue box 


/* global $, docCookies, ajaxer, PointsSetting, videoList, Problem*/



(function(){
    //CHECK IF USER IS LOGGED IN
    
	window.PointsSetting = (function(){
	    //earedCoin is used for rendering
		var points = 0, coins = 0, pointsPerCoin = 5, earnedCoin = false, global = this;
		return {
		    //coins earned can be never taken away. Only points.
		    init: function(){
                /*get saved poitns, coins and other config */
		    },
		    getCoins: function(){
		        return coins;
		    },
		    changePoints : function(d){
		        points += parseInt(d);
		        if(points < 0){
		            points = 0;
		        } else if(points >= pointsPerCoin){
		            earnedCoin = true;
		            coins += parseInt(Math.floor(points / pointsPerCoin));
		            points %= points / pointsPerCoin;
		        }
		        return global;
		    },
		    setPoints : function(p){
                points = parseInt(p);  
		        return global;
		    },
		    setPointsPerCoin : function(n){
		        if(n > 0) pointsPerCoin = parseInt(n);  
		        return global;
		    },
		    saveSetting : function(){
		        docCookies.setItem('points', points);
		        docCookies.setItem('coins', coins);
		        docCookies.setItem('pointsPerCoin', pointsPerCoin);
		        return global;
		    },
		    loadSetting: function(){
		        points = docCookies.hasItem('points') ? parseInt(docCookies.getItem('points')) : 0;
		        coins = docCookies.hasItem('coins') ? parseInt(docCookies.getItem('coins')) : 0;
		        pointsPerCoin = docCookies.hasItem('pointsPerCoin') 
		                ? parseInt(docCookies.getItem('pointsPerCoin')) : 5;
		        return global;
		    },
		    renderState: function(){
		        var t = 0;
		        $('#coins').text(coins);
		        if(earnedCoin){ //render full points
		            $('.checkmark').addClass('checked');
		            t = 500;
    		        $('#coins').text(coins).effect(
                        'highlight', 
                        {color: 'yellow', easing: 'easeOutBack'},
                        1500 // , callBack()
                    );
		        }
	            //render current points
		        setTimeout(function(){
		            $('.checked').removeClass('checked');
                    $('.checkmark').each(function(i){
                        if(i < points){
                            $(this).addClass('checked');
                        }
                    });
		        }, t);
		        return global;
            },
            renderPointBoxes : function(){
            	$('#point-boxes').empty();
            	var p = pointsPerCoin;
            	var height = Math.ceil(p/5);
            	for(var k = 0; k < p; k++){
            		var cm = $('<div></div>').addClass('checkmark');
            		var pb = $('<div></div>').addClass('point-box').append(cm);
            		$('#point-boxes').append(pb);
            	}
            	$('#point-boxes').css('height', height * 40);
            	$('#point-boxes').css('width', 200);
		        return global;
            },
            /// delete these after development
            setCoins: function(c){
                coins = parseInt(c);
            },
            getState: function(){
                return 'points: ' + points + '\tcoins: ' + coins;
            }
		}
	}());
	
	// stat reporter should be part of the problem, but timer is part of init
	// returns time in ms
	window.Timer = (function(){
	    var startTime;
	    return {
	        start : function(){
	            startTime = new Date();
	        }, 
	        getRunningTime : function(){
	            return (new Date()) - startTime();
	        },
	        getTime: function(){
	            if(startTime){
    	            var t = (new Date()) - startTime;
    	            this.stop();
    	            return t;
    	        } else {
    	            throw "timer hasn't started";
    	        }
	        },
	        stop : function(){
                startTime = undefined;  
	        }
	    };
	}());
	
	/*\
    |*|
    |*|  :: cookies.js ::
    |*|
    |*|  A complete cookies reader/writer framework with full unicode support.
    |*|
    |*|  Revision #1 - September 4, 2014
    |*|
    |*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
    |*|  https://developer.mozilla.org/User:fusionchess
    |*|  https://github.com/madmurphy/cookies.js
    |*|
    |*|  This framework is released under the GNU Public License, version 3 or later.
    |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
    |*|
    |*|  Syntaxes:
    |*|
    |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
    |*|  * docCookies.getItem(name)
    |*|  * docCookies.removeItem(name[, path[, domain]])
    |*|  * docCookies.hasItem(name)
    |*|  * docCookies.keys()
    |*|
    \*/
    window.docCookies = {
    	getItem: function (sKey) {
    		if (!sKey) { return null; }
    		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    	},
    	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    		var sExpires = "";
    		if (vEnd) {
        		switch (vEnd.constructor) {
            		case Number:
            			sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            			break;
        			case String:
            			sExpires = "; expires=" + vEnd;
            			break;
            		case Date:
            			sExpires = "; expires=" + vEnd.toUTCString();
            			break;
        		}
        	}
        	document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        	return true;
    	},
    	removeItem: function (sKey, sPath, sDomain) {
    		if (!this.hasItem(sKey)) { return false; }
    		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    		return true;
    	},
    	hasItem: function (sKey) {
    		if (!sKey) { return false; }
    		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    	},
    	keys: function () {
    		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    		return aKeys;
    	}
    };
    
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
    
    window.ajaxer = function(o){
    	/*
    		Object.getOwnPropertyNames(o) ->
    		[requestHandler, requestType, data, successHandler, errorHandler, dataType]
    	*/
    	var append = '';
        $.ajax({
    		url : append + 'php/' + o.requestHandler,
    		crossDomain : true,
    		type : o.requestType,
    		data : o.data,
    		success : function(response){
    			o.successHandler(response);
    		},
    		error: function(jqXHR, textStatus, errorThrown){
    		    var text = 'jqXHR.responseText:  ' + jqXHR.responseText
    		            +'<br>jqXHR.responseXML :  ' + jqXHR.responseXML
    			        +'<br>textStatus:   ' +  textStatus
            			+'<br>errorThrown:   ' + errorThrown;
    			console.log(text);
    			if(o.errorHandler) o.errorHandler(jqXHR, textStatus, errorThrown);
    		},
    		dataType : (o.dataType || 'text') //expected data type to be returned from server
    	});
    }
    
    // returns a date and time in 'YYYY-MM-DD HH:MM' format
    // passing 'date' or 'time' will return such string.
    window.getDateTime = function(option){
    
        var k = new Date();
        var y = k.getFullYear(), m = k.getMonth() + 1, d = k.getDate(), 
        min = k.getMinutes(), h = (k.getHours() + (k.getTimezoneOffset()/60));
        m = m < 10 ? '0' + m : m;
        d = d < 10 ? '0' + d : d;
        min = min < 10 ? '0' + min : min;
        h = h < 10 ? '0' + h : h;
        
        var date = '' + y + '-' + m + '-' + d;
        var time = '' + h + ':' + min;
        if(option == 'date'){
            return date;
        } else if(option == 'time'){
            return time;
        } else {
            return date + ' ' + time;    
        }
    }
	
    
	// get video list
	var listObj = (function(){
	    //var listObj = get video list via ajaxer
	    var str = '[{"seriesName":"Batman Beyond","seasons":1,"episodes":[[{"file":"Batman Beyond - 01 - Rebirth (Part 1)   [DarkDream].mp4","epTitle":"Batman Beyond - 01 - Rebirth (Part 1)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 01 - Rebirth (Part 1)   [DarkDream].mp4"},{"file":"Batman Beyond - 02 - Rebirth (Part 2)   [DarkDream].mp4","epTitle":"Batman Beyond - 02 - Rebirth (Part 2)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 02 - Rebirth (Part 2)   [DarkDream].mp4"},{"file":"Batman Beyond - 03 - Black Out   [DarkDream].mp4","epTitle":"Batman Beyond - 03 - Black Out   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 03 - Black Out   [DarkDream].mp4"},{"file":"Batman Beyond - 04 - Golem   [DarkDream].mp4","epTitle":"Batman Beyond - 04 - Golem   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 04 - Golem   [DarkDream].mp4"},{"file":"Batman Beyond - 05 - Meltdown   [DarkDream].mp4","epTitle":"Batman Beyond - 05 - Meltdown   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 05 - Meltdown   [DarkDream].mp4"},{"file":"Batman Beyond - 06 - Heroes   [DarkDream].mp4","epTitle":"Batman Beyond - 06 - Heroes   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 06 - Heroes   [DarkDream].mp4"},{"file":"Batman Beyond - 07 - Shriek   [DarkDream].mp4","epTitle":"Batman Beyond - 07 - Shriek   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 07 - Shriek   [DarkDream].mp4"},{"file":"Batman Beyond - 08 - Dead Man\'s Hand   [DarkDream].mp4","epTitle":"Batman Beyond - 08 - Dead Man\'s Hand   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 08 - Dead Man\'s Hand   [DarkDream].mp4"},{"file":"Batman Beyond - 09 - The Winning Edge   [DarkDream].mp4","epTitle":"Batman Beyond - 09 - The Winning Edge   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 09 - The Winning Edge   [DarkDream].mp4"},{"file":"Batman Beyond - 10 - Spellbound   [DarkDream].mp4","epTitle":"Batman Beyond - 10 - Spellbound   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 10 - Spellbound   [DarkDream].mp4"},{"file":"Batman Beyond - 11 - Disappearing Inque   [DarkDream].mp4","epTitle":"Batman Beyond - 11 - Disappearing Inque   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 11 - Disappearing Inque   [DarkDream].mp4"},{"file":"Batman Beyond - 12 - A Touch Of Curar\u00e9   [DarkDream].mp4","epTitle":"Batman Beyond - 12 - A Touch Of Curar\u00e9   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 12 - A Touch Of Curar\u00e9   [DarkDream].mp4"},{"file":"Batman Beyond - 13 - Ascension   [DarkDream].mp4","epTitle":"Batman Beyond - 13 - Ascension   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 13 - Ascension   [DarkDream].mp4"},{"file":"Batman Beyond - 14 - Splicers   [DarkDream].mp4","epTitle":"Batman Beyond - 14 - Splicers   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 14 - Splicers   [DarkDream].mp4"},{"file":"Batman Beyond - 15 - Earth Mover   [DarkDream].mp4","epTitle":"Batman Beyond - 15 - Earth Mover   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 15 - Earth Mover   [DarkDream].mp4"},{"file":"Batman Beyond - 16 - Joyride   [DarkDream].mp4","epTitle":"Batman Beyond - 16 - Joyride   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 16 - Joyride   [DarkDream].mp4"},{"file":"Batman Beyond - 17 - Lost Soul   [DarkDream].mp4","epTitle":"Batman Beyond - 17 - Lost Soul   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 17 - Lost Soul   [DarkDream].mp4"},{"file":"Batman Beyond - 18 - Hidden Agenda   [DarkDream].mp4","epTitle":"Batman Beyond - 18 - Hidden Agenda   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 18 - Hidden Agenda   [DarkDream].mp4"},{"file":"Batman Beyond - 19 - Bloodsport   [DarkDream].mp4","epTitle":"Batman Beyond - 19 - Bloodsport   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 19 - Bloodsport   [DarkDream].mp4"},{"file":"Batman Beyond - 20 - Once Burned   [DarkDream].mp4","epTitle":"Batman Beyond - 20 - Once Burned   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 20 - Once Burned   [DarkDream].mp4"},{"file":"Batman Beyond - 21 - Hooked Up   [DarkDream].mp4","epTitle":"Batman Beyond - 21 - Hooked Up   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 21 - Hooked Up   [DarkDream].mp4"},{"file":"Batman Beyond - 22 - Rats   [DarkDream].mp4","epTitle":"Batman Beyond - 22 - Rats   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 22 - Rats   [DarkDream].mp4"},{"file":"Batman Beyond - 23 - Mind Games   [DarkDream].mp4","epTitle":"Batman Beyond - 23 - Mind Games   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 23 - Mind Games   [DarkDream].mp4"},{"file":"Batman Beyond - 24 - Revenant   [DarkDream].mp4","epTitle":"Batman Beyond - 24 - Revenant   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 24 - Revenant   [DarkDream].mp4"},{"file":"Batman Beyond - 25 - Babel   [DarkDream].mp4","epTitle":"Batman Beyond - 25 - Babel   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 25 - Babel   [DarkDream].mp4"},{"file":"Batman Beyond - 26 - Terry\'s Friend Dates A Robot   [DarkDream].mp4","epTitle":"Batman Beyond - 26 - Terry\'s Friend Dates A Robot   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 26 - Terry\'s Friend Dates A Robot   [DarkDream].mp4"},{"file":"Batman Beyond - 27 - Eyewitness   [DarkDream].mp4","epTitle":"Batman Beyond - 27 - Eyewitness   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 27 - Eyewitness   [DarkDream].mp4"},{"file":"Batman Beyond - 28 - Final Cut   [DarkDream].mp4","epTitle":"Batman Beyond - 28 - Final Cut   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 28 - Final Cut   [DarkDream].mp4"},{"file":"Batman Beyond - 29 - The Last Resort   [DarkDream].mp4","epTitle":"Batman Beyond - 29 - The Last Resort   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 29 - The Last Resort   [DarkDream].mp4"},{"file":"Batman Beyond - 30 - Armory   [DarkDream].mp4","epTitle":"Batman Beyond - 30 - Armory   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 30 - Armory   [DarkDream].mp4"},{"file":"Batman Beyond - 31 - Sneak Peek   [DarkDream].mp4","epTitle":"Batman Beyond - 31 - Sneak Peek   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 31 - Sneak Peek   [DarkDream].mp4"},{"file":"Batman Beyond - 32 - The Eggbaby   [DarkDream].mp4","epTitle":"Batman Beyond - 32 - The Eggbaby   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 32 - The Eggbaby   [DarkDream].mp4"},{"file":"Batman Beyond - 33 - Zeta   [DarkDream].mp4","epTitle":"Batman Beyond - 33 - Zeta   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 33 - Zeta   [DarkDream].mp4"},{"file":"Batman Beyond - 34 - Plague   [DarkDream].mp4","epTitle":"Batman Beyond - 34 - Plague   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 34 - Plague   [DarkDream].mp4"},{"file":"Batman Beyond - 35 - April Moon   [DarkDream].mp4","epTitle":"Batman Beyond - 35 - April Moon   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 35 - April Moon   [DarkDream].mp4"},{"file":"Batman Beyond - 36 - Sentries Of The Last Cosmos   [DarkDream].mp4","epTitle":"Batman Beyond - 36 - Sentries Of The Last Cosmos   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 36 - Sentries Of The Last Cosmos   [DarkDream].mp4"},{"file":"Batman Beyond - 37 - Payback   [DarkDream].mp4","epTitle":"Batman Beyond - 37 - Payback   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 37 - Payback   [DarkDream].mp4"},{"file":"Batman Beyond - 38 - Where\'s Terry   [DarkDream].mp4","epTitle":"Batman Beyond - 38 - Where\'s Terry   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 38 - Where\'s Terry   [DarkDream].mp4"},{"file":"Batman Beyond - 39 - Ace In The Hole   [DarkDream].mp4","epTitle":"Batman Beyond - 39 - Ace In The Hole   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 39 - Ace In The Hole   [DarkDream].mp4"},{"file":"Batman Beyond - 40 - Kings Ransom   [DarkDream].mp4","epTitle":"Batman Beyond - 40 - Kings Ransom   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 40 - Kings Ransom   [DarkDream].mp4"},{"file":"Batman Beyond - 41 - Untouchable   [DarkDream].mp4","epTitle":"Batman Beyond - 41 - Untouchable   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 41 - Untouchable   [DarkDream].mp4"},{"file":"Batman Beyond - 42 - Inqueling   [DarkDream].mp4","epTitle":"Batman Beyond - 42 - Inqueling   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 42 - Inqueling   [DarkDream].mp4"},{"file":"Batman Beyond - 43 - Big Time   [DarkDream].mp4","epTitle":"Batman Beyond - 43 - Big Time   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 43 - Big Time   [DarkDream].mp4"},{"file":"Batman Beyond - 44 - Out Of The Past   [DarkDream].mp4","epTitle":"Batman Beyond - 44 - Out Of The Past   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 44 - Out Of The Past   [DarkDream].mp4"},{"file":"Batman Beyond - 45 - Speak No Evil   [DarkDream].mp4","epTitle":"Batman Beyond - 45 - Speak No Evil   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 45 - Speak No Evil   [DarkDream].mp4"},{"file":"Batman Beyond - 46 - The Call (Part 1)   [DarkDream].mp4","epTitle":"Batman Beyond - 46 - The Call (Part 1)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 46 - The Call (Part 1)   [DarkDream].mp4"},{"file":"Batman Beyond - 47 - The Call (Part 2)   [DarkDream].mp4","epTitle":"Batman Beyond - 47 - The Call (Part 2)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 47 - The Call (Part 2)   [DarkDream].mp4"},{"file":"Batman Beyond - 48 - Betrayal   [DarkDream].mp4","epTitle":"Batman Beyond - 48 - Betrayal   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 48 - Betrayal   [DarkDream].mp4"},{"file":"Batman Beyond - 49 - Curse Of The Kobra (Part 1)   [DarkDream].mp4","epTitle":"Batman Beyond - 49 - Curse Of The Kobra (Part 1)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 49 - Curse Of The Kobra (Part 1)   [DarkDream].mp4"},{"file":"Batman Beyond - 50 - Curse Of The Kobra (Part 2)   [DarkDream].mp4","epTitle":"Batman Beyond - 50 - Curse Of The Kobra (Part 2)   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 50 - Curse Of The Kobra (Part 2)   [DarkDream].mp4"},{"file":"Batman Beyond - 51 - Countdown   [DarkDream].mp4","epTitle":"Batman Beyond - 51 - Countdown   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 51 - Countdown   [DarkDream].mp4"},{"file":"Batman Beyond - 52 - Unmasked   [DarkDream].mp4","epTitle":"Batman Beyond - 52 - Unmasked   [DarkDream]","filePath":"videos\/Batman Beyond\/S01\/Batman Beyond - 52 - Unmasked   [DarkDream].mp4"}]]},{"seriesName":"SpongeBob SquarePants","seasons":8,"episodes":[[{"file":"101 Help Wanted.mp4","epTitle":"101 Help Wanted","filePath":"videos\/SpongeBob SquarePants\/S01\/101 Help Wanted.mp4"},{"file":"102 Reef Blower.mp4","epTitle":"102 Reef Blower","filePath":"videos\/SpongeBob SquarePants\/S01\/102 Reef Blower.mp4"},{"file":"103 Tea at the Treedome.mp4","epTitle":"103 Tea at the Treedome","filePath":"videos\/SpongeBob SquarePants\/S01\/103 Tea at the Treedome.mp4"},{"file":"104 Bubblestand.mp4","epTitle":"104 Bubblestand","filePath":"videos\/SpongeBob SquarePants\/S01\/104 Bubblestand.mp4"},{"file":"105 Ripped Pants.mp4","epTitle":"105 Ripped Pants","filePath":"videos\/SpongeBob SquarePants\/S01\/105 Ripped Pants.mp4"},{"file":"106 Jellyfishing.mp4","epTitle":"106 Jellyfishing","filePath":"videos\/SpongeBob SquarePants\/S01\/106 Jellyfishing.mp4"},{"file":"107 Plankton!.mp4","epTitle":"107 Plankton!","filePath":"videos\/SpongeBob SquarePants\/S01\/107 Plankton!.mp4"},{"file":"108 Naughty Nautical Neighbors.mp4","epTitle":"108 Naughty Nautical Neighbors","filePath":"videos\/SpongeBob SquarePants\/S01\/108 Naughty Nautical Neighbors.mp4"},{"file":"109 Boating School.mp4","epTitle":"109 Boating School","filePath":"videos\/SpongeBob SquarePants\/S01\/109 Boating School.mp4"},{"file":"110 Pizza Delivery.mp4","epTitle":"110 Pizza Delivery","filePath":"videos\/SpongeBob SquarePants\/S01\/110 Pizza Delivery.mp4"},{"file":"111 Home Sweet Pineapple.mp4","epTitle":"111 Home Sweet Pineapple","filePath":"videos\/SpongeBob SquarePants\/S01\/111 Home Sweet Pineapple.mp4"},{"file":"112 Mermaidman and Barnacleboy.mp4","epTitle":"112 Mermaidman and Barnacleboy","filePath":"videos\/SpongeBob SquarePants\/S01\/112 Mermaidman and Barnacleboy.mp4"},{"file":"113 Pickles.mp4","epTitle":"113 Pickles","filePath":"videos\/SpongeBob SquarePants\/S01\/113 Pickles.mp4"},{"file":"114 Hall Monitor.mp4","epTitle":"114 Hall Monitor","filePath":"videos\/SpongeBob SquarePants\/S01\/114 Hall Monitor.mp4"},{"file":"115 Jellyfish Jam.mp4","epTitle":"115 Jellyfish Jam","filePath":"videos\/SpongeBob SquarePants\/S01\/115 Jellyfish Jam.mp4"},{"file":"116 Sandy\'s Rocket.mp4","epTitle":"116 Sandy\'s Rocket","filePath":"videos\/SpongeBob SquarePants\/S01\/116 Sandy\'s Rocket.mp4"},{"file":"117 Squeaky Boots.mp4","epTitle":"117 Squeaky Boots","filePath":"videos\/SpongeBob SquarePants\/S01\/117 Squeaky Boots.mp4"},{"file":"118 Nature Pants.mp4","epTitle":"118 Nature Pants","filePath":"videos\/SpongeBob SquarePants\/S01\/118 Nature Pants.mp4"},{"file":"119 Opposite Day.mp4","epTitle":"119 Opposite Day","filePath":"videos\/SpongeBob SquarePants\/S01\/119 Opposite Day.mp4"},{"file":"120 Culture Shock.mp4","epTitle":"120 Culture Shock","filePath":"videos\/SpongeBob SquarePants\/S01\/120 Culture Shock.mp4"},{"file":"121 F.U.N..mp4","epTitle":"121 F.U.N.","filePath":"videos\/SpongeBob SquarePants\/S01\/121 F.U.N..mp4"},{"file":"122 MuscleBob BuffPants.mp4","epTitle":"122 MuscleBob BuffPants","filePath":"videos\/SpongeBob SquarePants\/S01\/122 MuscleBob BuffPants.mp4"},{"file":"123 Squidward, the Unfriendly Ghost.mp4","epTitle":"123 Squidward, the Unfriendly Ghost","filePath":"videos\/SpongeBob SquarePants\/S01\/123 Squidward, the Unfriendly Ghost.mp4"},{"file":"124 The Chaperone.mp4","epTitle":"124 The Chaperone","filePath":"videos\/SpongeBob SquarePants\/S01\/124 The Chaperone.mp4"},{"file":"125 Employee of the Month.mp4","epTitle":"125 Employee of the Month","filePath":"videos\/SpongeBob SquarePants\/S01\/125 Employee of the Month.mp4"},{"file":"126 Scaredy Pants.mp4","epTitle":"126 Scaredy Pants","filePath":"videos\/SpongeBob SquarePants\/S01\/126 Scaredy Pants.mp4"},{"file":"127 I Was a Teenage Gary.mp4","epTitle":"127 I Was a Teenage Gary","filePath":"videos\/SpongeBob SquarePants\/S01\/127 I Was a Teenage Gary.mp4"},{"file":"128 SB-129.mp4","epTitle":"128 SB-129","filePath":"videos\/SpongeBob SquarePants\/S01\/128 SB-129.mp4"},{"file":"129 Karate Choppers.mp4","epTitle":"129 Karate Choppers","filePath":"videos\/SpongeBob SquarePants\/S01\/129 Karate Choppers.mp4"},{"file":"130 Sleepy Time.mp4","epTitle":"130 Sleepy Time","filePath":"videos\/SpongeBob SquarePants\/S01\/130 Sleepy Time.mp4"},{"file":"131 Suds.mp4","epTitle":"131 Suds","filePath":"videos\/SpongeBob SquarePants\/S01\/131 Suds.mp4"},{"file":"132 Valentine\'s Day.mp4","epTitle":"132 Valentine\'s Day","filePath":"videos\/SpongeBob SquarePants\/S01\/132 Valentine\'s Day.mp4"},{"file":"133 The Paper.mp4","epTitle":"133 The Paper","filePath":"videos\/SpongeBob SquarePants\/S01\/133 The Paper.mp4"},{"file":"134 Arrgh!.mp4","epTitle":"134 Arrgh!","filePath":"videos\/SpongeBob SquarePants\/S01\/134 Arrgh!.mp4"},{"file":"135 Rock Bottom.mp4","epTitle":"135 Rock Bottom","filePath":"videos\/SpongeBob SquarePants\/S01\/135 Rock Bottom.mp4"},{"file":"136 Texas.mp4","epTitle":"136 Texas","filePath":"videos\/SpongeBob SquarePants\/S01\/136 Texas.mp4"},{"file":"137 Walking Small.mp4","epTitle":"137 Walking Small","filePath":"videos\/SpongeBob SquarePants\/S01\/137 Walking Small.mp4"},{"file":"138 Fools in April.mp4","epTitle":"138 Fools in April","filePath":"videos\/SpongeBob SquarePants\/S01\/138 Fools in April.mp4"},{"file":"139 Neptune\'s Spatula.mp4","epTitle":"139 Neptune\'s Spatula","filePath":"videos\/SpongeBob SquarePants\/S01\/139 Neptune\'s Spatula.mp4"},{"file":"140 Hooky.mp4","epTitle":"140 Hooky","filePath":"videos\/SpongeBob SquarePants\/S01\/140 Hooky.mp4"},{"file":"141 Mermaidman and Barnacleboy II.mp4","epTitle":"141 Mermaidman and Barnacleboy II","filePath":"videos\/SpongeBob SquarePants\/S01\/141 Mermaidman and Barnacleboy II.mp4"}],[{"file":"201 Your Shoe\'s Untied.mp4","epTitle":"201 Your Shoe\'s Untied","filePath":"videos\/SpongeBob SquarePants\/S02\/201 Your Shoe\'s Untied.mp4"},{"file":"202 Squid\'s Day Off.mp4","epTitle":"202 Squid\'s Day Off","filePath":"videos\/SpongeBob SquarePants\/S02\/202 Squid\'s Day Off.mp4"},{"file":"203 Something Smells.mp4","epTitle":"203 Something Smells","filePath":"videos\/SpongeBob SquarePants\/S02\/203 Something Smells.mp4"},{"file":"204 Bossy Boots.mp4","epTitle":"204 Bossy Boots","filePath":"videos\/SpongeBob SquarePants\/S02\/204 Bossy Boots.mp4"},{"file":"205 Big Pink Loser.mp4","epTitle":"205 Big Pink Loser","filePath":"videos\/SpongeBob SquarePants\/S02\/205 Big Pink Loser.mp4"},{"file":"206 Bubble Buddy.mp4","epTitle":"206 Bubble Buddy","filePath":"videos\/SpongeBob SquarePants\/S02\/206 Bubble Buddy.mp4"},{"file":"207 Dying for Pie.mp4","epTitle":"207 Dying for Pie","filePath":"videos\/SpongeBob SquarePants\/S02\/207 Dying for Pie.mp4"},{"file":"208 Imitation Krabs.mp4","epTitle":"208 Imitation Krabs","filePath":"videos\/SpongeBob SquarePants\/S02\/208 Imitation Krabs.mp4"},{"file":"209 Wormy.mp4","epTitle":"209 Wormy","filePath":"videos\/SpongeBob SquarePants\/S02\/209 Wormy.mp4"},{"file":"210 Patty Hype.mp4","epTitle":"210 Patty Hype","filePath":"videos\/SpongeBob SquarePants\/S02\/210 Patty Hype.mp4"},{"file":"211 Grandma\'s Kisses.mp4","epTitle":"211 Grandma\'s Kisses","filePath":"videos\/SpongeBob SquarePants\/S02\/211 Grandma\'s Kisses.mp4"},{"file":"212 Squidville.mp4","epTitle":"212 Squidville","filePath":"videos\/SpongeBob SquarePants\/S02\/212 Squidville.mp4"},{"file":"213 Prehibernation Week.mp4","epTitle":"213 Prehibernation Week","filePath":"videos\/SpongeBob SquarePants\/S02\/213 Prehibernation Week.mp4"},{"file":"214 Life of Crime.mp4","epTitle":"214 Life of Crime","filePath":"videos\/SpongeBob SquarePants\/S02\/214 Life of Crime.mp4"},{"file":"215 Christmas Who.mp4","epTitle":"215 Christmas Who","filePath":"videos\/SpongeBob SquarePants\/S02\/215 Christmas Who.mp4"},{"file":"216 Survival of the Idiots.mp4","epTitle":"216 Survival of the Idiots","filePath":"videos\/SpongeBob SquarePants\/S02\/216 Survival of the Idiots.mp4"},{"file":"217 Dumped.mp4","epTitle":"217 Dumped","filePath":"videos\/SpongeBob SquarePants\/S02\/217 Dumped.mp4"},{"file":"218 No Free Rides.mp4","epTitle":"218 No Free Rides","filePath":"videos\/SpongeBob SquarePants\/S02\/218 No Free Rides.mp4"},{"file":"219 I\'m Your Biggest Fanatic.mp4","epTitle":"219 I\'m Your Biggest Fanatic","filePath":"videos\/SpongeBob SquarePants\/S02\/219 I\'m Your Biggest Fanatic.mp4"},{"file":"220 Mermaidman and Barnacleboy III.mp4","epTitle":"220 Mermaidman and Barnacleboy III","filePath":"videos\/SpongeBob SquarePants\/S02\/220 Mermaidman and Barnacleboy III.mp4"},{"file":"221 Squirrel Jokes.mp4","epTitle":"221 Squirrel Jokes","filePath":"videos\/SpongeBob SquarePants\/S02\/221 Squirrel Jokes.mp4"},{"file":"222 Pressure.mp4","epTitle":"222 Pressure","filePath":"videos\/SpongeBob SquarePants\/S02\/222 Pressure.mp4"},{"file":"223 The Smoking Peanut.mp4","epTitle":"223 The Smoking Peanut","filePath":"videos\/SpongeBob SquarePants\/S02\/223 The Smoking Peanut.mp4"},{"file":"224 Shanghaied.mp4","epTitle":"224 Shanghaied","filePath":"videos\/SpongeBob SquarePants\/S02\/224 Shanghaied.mp4"},{"file":"225 Gary Takes a Bath.mp4","epTitle":"225 Gary Takes a Bath","filePath":"videos\/SpongeBob SquarePants\/S02\/225 Gary Takes a Bath.mp4"},{"file":"226 Welcome to the Chum Bucket.mp4","epTitle":"226 Welcome to the Chum Bucket","filePath":"videos\/SpongeBob SquarePants\/S02\/226 Welcome to the Chum Bucket.mp4"},{"file":"227 Frankendoodle.mp4","epTitle":"227 Frankendoodle","filePath":"videos\/SpongeBob SquarePants\/S02\/227 Frankendoodle.mp4"},{"file":"228 The Secret Box.mp4","epTitle":"228 The Secret Box","filePath":"videos\/SpongeBob SquarePants\/S02\/228 The Secret Box.mp4"},{"file":"229 Band Geeks.mp4","epTitle":"229 Band Geeks","filePath":"videos\/SpongeBob SquarePants\/S02\/229 Band Geeks.mp4"},{"file":"230 Graveyard Shift.mp4","epTitle":"230 Graveyard Shift","filePath":"videos\/SpongeBob SquarePants\/S02\/230 Graveyard Shift.mp4"},{"file":"231 Krusty Love.mp4","epTitle":"231 Krusty Love","filePath":"videos\/SpongeBob SquarePants\/S02\/231 Krusty Love.mp4"},{"file":"232 Procrastination.mp4","epTitle":"232 Procrastination","filePath":"videos\/SpongeBob SquarePants\/S02\/232 Procrastination.mp4"},{"file":"233 I\'m with Stupid.mp4","epTitle":"233 I\'m with Stupid","filePath":"videos\/SpongeBob SquarePants\/S02\/233 I\'m with Stupid.mp4"},{"file":"234 Sailor Mouth.mp4","epTitle":"234 Sailor Mouth","filePath":"videos\/SpongeBob SquarePants\/S02\/234 Sailor Mouth.mp4"},{"file":"235 Artist Unknown.mp4","epTitle":"235 Artist Unknown","filePath":"videos\/SpongeBob SquarePants\/S02\/235 Artist Unknown.mp4"},{"file":"236 Jellyfish Hunter.mp4","epTitle":"236 Jellyfish Hunter","filePath":"videos\/SpongeBob SquarePants\/S02\/236 Jellyfish Hunter.mp4"},{"file":"237 The Fry Cook Games.mp4","epTitle":"237 The Fry Cook Games","filePath":"videos\/SpongeBob SquarePants\/S02\/237 The Fry Cook Games.mp4"},{"file":"238 Squid on Strike.mp4","epTitle":"238 Squid on Strike","filePath":"videos\/SpongeBob SquarePants\/S02\/238 Squid on Strike.mp4"},{"file":"239 Sandy, SpongeBob, and the Worm.mp4","epTitle":"239 Sandy, SpongeBob, and the Worm","filePath":"videos\/SpongeBob SquarePants\/S02\/239 Sandy, SpongeBob, and the Worm.mp4"}],[{"file":"301 The Algae\'s Always Greener.mp4","epTitle":"301 The Algae\'s Always Greener","filePath":"videos\/SpongeBob SquarePants\/S03\/301 The Algae\'s Always Greener.mp4"},{"file":"302 SpongeGuard on Duty.mp4","epTitle":"302 SpongeGuard on Duty","filePath":"videos\/SpongeBob SquarePants\/S03\/302 SpongeGuard on Duty.mp4"},{"file":"303 Club SpongeBob.mp4","epTitle":"303 Club SpongeBob","filePath":"videos\/SpongeBob SquarePants\/S03\/303 Club SpongeBob.mp4"},{"file":"304 My Pretty Seahorse.mp4","epTitle":"304 My Pretty Seahorse","filePath":"videos\/SpongeBob SquarePants\/S03\/304 My Pretty Seahorse.mp4"},{"file":"305 Just One Bite.mp4","epTitle":"305 Just One Bite","filePath":"videos\/SpongeBob SquarePants\/S03\/305 Just One Bite.mp4"},{"file":"306 The Bully.mp4","epTitle":"306 The Bully","filePath":"videos\/SpongeBob SquarePants\/S03\/306 The Bully.mp4"},{"file":"307 Nasty Patty.mp4","epTitle":"307 Nasty Patty","filePath":"videos\/SpongeBob SquarePants\/S03\/307 Nasty Patty.mp4"},{"file":"308 Idiot Box.mp4","epTitle":"308 Idiot Box","filePath":"videos\/SpongeBob SquarePants\/S03\/308 Idiot Box.mp4"},{"file":"309 Mermaidman and Barnacleboy IV.mp4","epTitle":"309 Mermaidman and Barnacleboy IV","filePath":"videos\/SpongeBob SquarePants\/S03\/309 Mermaidman and Barnacleboy IV.mp4"},{"file":"310 Doing Time.mp4","epTitle":"310 Doing Time","filePath":"videos\/SpongeBob SquarePants\/S03\/310 Doing Time.mp4"},{"file":"311 Snowball Effect.mp4","epTitle":"311 Snowball Effect","filePath":"videos\/SpongeBob SquarePants\/S03\/311 Snowball Effect.mp4"},{"file":"312 One Krabs Trash.mp4","epTitle":"312 One Krabs Trash","filePath":"videos\/SpongeBob SquarePants\/S03\/312 One Krabs Trash.mp4"},{"file":"313 As Seen on TV.mp4","epTitle":"313 As Seen on TV","filePath":"videos\/SpongeBob SquarePants\/S03\/313 As Seen on TV.mp4"},{"file":"314 Can You Spare a Dime.mp4","epTitle":"314 Can You Spare a Dime","filePath":"videos\/SpongeBob SquarePants\/S03\/314 Can You Spare a Dime.mp4"},{"file":"315 No Weenies Allowed.mp4","epTitle":"315 No Weenies Allowed","filePath":"videos\/SpongeBob SquarePants\/S03\/315 No Weenies Allowed.mp4"},{"file":"316 Squilliam Returns.mp4","epTitle":"316 Squilliam Returns","filePath":"videos\/SpongeBob SquarePants\/S03\/316 Squilliam Returns.mp4"},{"file":"317 Krab-Borg.mp4","epTitle":"317 Krab-Borg","filePath":"videos\/SpongeBob SquarePants\/S03\/317 Krab-Borg.mp4"},{"file":"318 Rock-a-Bye Bivalve.mp4","epTitle":"318 Rock-a-Bye Bivalve","filePath":"videos\/SpongeBob SquarePants\/S03\/318 Rock-a-Bye Bivalve.mp4"},{"file":"319 Wet Painters.mp4","epTitle":"319 Wet Painters","filePath":"videos\/SpongeBob SquarePants\/S03\/319 Wet Painters.mp4"},{"file":"320 Krusty Krab Training Video.mp4","epTitle":"320 Krusty Krab Training Video","filePath":"videos\/SpongeBob SquarePants\/S03\/320 Krusty Krab Training Video.mp4"},{"file":"321 Party Pooper Pants.mp4","epTitle":"321 Party Pooper Pants","filePath":"videos\/SpongeBob SquarePants\/S03\/321 Party Pooper Pants.mp4"},{"file":"322 Chocolate with Nuts.mp4","epTitle":"322 Chocolate with Nuts","filePath":"videos\/SpongeBob SquarePants\/S03\/322 Chocolate with Nuts.mp4"},{"file":"323 Mermaidman and Barnacleboy V.mp4","epTitle":"323 Mermaidman and Barnacleboy V","filePath":"videos\/SpongeBob SquarePants\/S03\/323 Mermaidman and Barnacleboy V.mp4"},{"file":"324 New Student Starfish.mp4","epTitle":"324 New Student Starfish","filePath":"videos\/SpongeBob SquarePants\/S03\/324 New Student Starfish.mp4"},{"file":"325 Clams.mp4","epTitle":"325 Clams","filePath":"videos\/SpongeBob SquarePants\/S03\/325 Clams.mp4"},{"file":"326 Ugh.mp4","epTitle":"326 Ugh","filePath":"videos\/SpongeBob SquarePants\/S03\/326 Ugh.mp4"},{"file":"327 The Great Snail Race.mp4","epTitle":"327 The Great Snail Race","filePath":"videos\/SpongeBob SquarePants\/S03\/327 The Great Snail Race.mp4"},{"file":"328 Mid-Life Crustacean.mp4","epTitle":"328 Mid-Life Crustacean","filePath":"videos\/SpongeBob SquarePants\/S03\/328 Mid-Life Crustacean.mp4"},{"file":"329 Born Again Krabs.mp4","epTitle":"329 Born Again Krabs","filePath":"videos\/SpongeBob SquarePants\/S03\/329 Born Again Krabs.mp4"},{"file":"330 I Had an Accident.mp4","epTitle":"330 I Had an Accident","filePath":"videos\/SpongeBob SquarePants\/S03\/330 I Had an Accident.mp4"},{"file":"331 Krabby Land.mp4","epTitle":"331 Krabby Land","filePath":"videos\/SpongeBob SquarePants\/S03\/331 Krabby Land.mp4"},{"file":"332 The Camping Episode.mp4","epTitle":"332 The Camping Episode","filePath":"videos\/SpongeBob SquarePants\/S03\/332 The Camping Episode.mp4"},{"file":"333 Missing Identity.mp4","epTitle":"333 Missing Identity","filePath":"videos\/SpongeBob SquarePants\/S03\/333 Missing Identity.mp4"},{"file":"334 Plankton\'s Army.mp4","epTitle":"334 Plankton\'s Army","filePath":"videos\/SpongeBob SquarePants\/S03\/334 Plankton\'s Army.mp4"},{"file":"335 The Sponge Who Could Fly.mp4","epTitle":"335 The Sponge Who Could Fly","filePath":"videos\/SpongeBob SquarePants\/S03\/335 The Sponge Who Could Fly.mp4"},{"file":"336 SpongeBob Meets the Strangler.mp4","epTitle":"336 SpongeBob Meets the Strangler","filePath":"videos\/SpongeBob SquarePants\/S03\/336 SpongeBob Meets the Strangler.mp4"},{"file":"337 Pranks a Lot.mp4","epTitle":"337 Pranks a Lot","filePath":"videos\/SpongeBob SquarePants\/S03\/337 Pranks a Lot.mp4"}],[{"file":"401 Fear of a Krabby Patty.mp4","epTitle":"401 Fear of a Krabby Patty","filePath":"videos\/SpongeBob SquarePants\/S04\/401 Fear of a Krabby Patty.mp4"},{"file":"402 Shell of a Man.mp4","epTitle":"402 Shell of a Man","filePath":"videos\/SpongeBob SquarePants\/S04\/402 Shell of a Man.mp4"},{"file":"403 The Lost Mattress.mp4","epTitle":"403 The Lost Mattress","filePath":"videos\/SpongeBob SquarePants\/S04\/403 The Lost Mattress.mp4"},{"file":"404 Krabs vs. Plankton.mp4","epTitle":"404 Krabs vs. Plankton","filePath":"videos\/SpongeBob SquarePants\/S04\/404 Krabs vs. Plankton.mp4"},{"file":"405 Have You Seen This Snail.mp4","epTitle":"405 Have You Seen This Snail","filePath":"videos\/SpongeBob SquarePants\/S04\/405 Have You Seen This Snail.mp4"},{"file":"406 Skill Crane.mp4","epTitle":"406 Skill Crane","filePath":"videos\/SpongeBob SquarePants\/S04\/406 Skill Crane.mp4"},{"file":"407 Good Neighbors.mp4","epTitle":"407 Good Neighbors","filePath":"videos\/SpongeBob SquarePants\/S04\/407 Good Neighbors.mp4"},{"file":"408 Selling Out.mp4","epTitle":"408 Selling Out","filePath":"videos\/SpongeBob SquarePants\/S04\/408 Selling Out.mp4"},{"file":"409 Funny Pants.mp4","epTitle":"409 Funny Pants","filePath":"videos\/SpongeBob SquarePants\/S04\/409 Funny Pants.mp4"},{"file":"410 Dunces and Dragons.mp4","epTitle":"410 Dunces and Dragons","filePath":"videos\/SpongeBob SquarePants\/S04\/410 Dunces and Dragons.mp4"},{"file":"411 Enemy in Law.mp4","epTitle":"411 Enemy in Law","filePath":"videos\/SpongeBob SquarePants\/S04\/411 Enemy in Law.mp4"},{"file":"412 Mermaidman and Barnacleboy VI - The Motion Picture.mp4","epTitle":"412 Mermaidman and Barnacleboy VI - The Motion Picture","filePath":"videos\/SpongeBob SquarePants\/S04\/412 Mermaidman and Barnacleboy VI - The Motion Picture.mp4"},{"file":"413 Patrick Smartpants.mp4","epTitle":"413 Patrick Smartpants","filePath":"videos\/SpongeBob SquarePants\/S04\/413 Patrick Smartpants.mp4"},{"file":"414 SquidBob TentaclePants.mp4","epTitle":"414 SquidBob TentaclePants","filePath":"videos\/SpongeBob SquarePants\/S04\/414 SquidBob TentaclePants.mp4"},{"file":"415 Krusty Towers.mp4","epTitle":"415 Krusty Towers","filePath":"videos\/SpongeBob SquarePants\/S04\/415 Krusty Towers.mp4"},{"file":"416 Mrs. Puff, You\'re Fired.mp4","epTitle":"416 Mrs. Puff, You\'re Fired","filePath":"videos\/SpongeBob SquarePants\/S04\/416 Mrs. Puff, You\'re Fired.mp4"},{"file":"417 Ghost Host.mp4","epTitle":"417 Ghost Host","filePath":"videos\/SpongeBob SquarePants\/S04\/417 Ghost Host.mp4"},{"file":"418 Chimps Ahoy.mp4","epTitle":"418 Chimps Ahoy","filePath":"videos\/SpongeBob SquarePants\/S04\/418 Chimps Ahoy.mp4"},{"file":"419 Whale of a Birthday.mp4","epTitle":"419 Whale of a Birthday","filePath":"videos\/SpongeBob SquarePants\/S04\/419 Whale of a Birthday.mp4"},{"file":"420 Karate Island.mp4","epTitle":"420 Karate Island","filePath":"videos\/SpongeBob SquarePants\/S04\/420 Karate Island.mp4"},{"file":"421 All That Glitters.mp4","epTitle":"421 All That Glitters","filePath":"videos\/SpongeBob SquarePants\/S04\/421 All That Glitters.mp4"},{"file":"422 Wishing You Well.mp4","epTitle":"422 Wishing You Well","filePath":"videos\/SpongeBob SquarePants\/S04\/422 Wishing You Well.mp4"},{"file":"423 New Leaf.mp4","epTitle":"423 New Leaf","filePath":"videos\/SpongeBob SquarePants\/S04\/423 New Leaf.mp4"},{"file":"424 Once Bitten.mp4","epTitle":"424 Once Bitten","filePath":"videos\/SpongeBob SquarePants\/S04\/424 Once Bitten.mp4"},{"file":"425 Squidtastic Voyage.mp4","epTitle":"425 Squidtastic Voyage","filePath":"videos\/SpongeBob SquarePants\/S04\/425 Squidtastic Voyage.mp4"},{"file":"426 Wigstruck.mp4","epTitle":"426 Wigstruck","filePath":"videos\/SpongeBob SquarePants\/S04\/426 Wigstruck.mp4"},{"file":"427 Bummer Vacation.mp4","epTitle":"427 Bummer Vacation","filePath":"videos\/SpongeBob SquarePants\/S04\/427 Bummer Vacation.mp4"},{"file":"428 That\'s No Lady.mp4","epTitle":"428 That\'s No Lady","filePath":"videos\/SpongeBob SquarePants\/S04\/428 That\'s No Lady.mp4"},{"file":"429 The Thing.mp4","epTitle":"429 The Thing","filePath":"videos\/SpongeBob SquarePants\/S04\/429 The Thing.mp4"},{"file":"430 Hocus Pocus.mp4","epTitle":"430 Hocus Pocus","filePath":"videos\/SpongeBob SquarePants\/S04\/430 Hocus Pocus.mp4"},{"file":"431 Driven to Tears.mp4","epTitle":"431 Driven to Tears","filePath":"videos\/SpongeBob SquarePants\/S04\/431 Driven to Tears.mp4"},{"file":"432 Rule of Dumb.mp4","epTitle":"432 Rule of Dumb","filePath":"videos\/SpongeBob SquarePants\/S04\/432 Rule of Dumb.mp4"},{"file":"433 Born to be Wild.mp4","epTitle":"433 Born to be Wild","filePath":"videos\/SpongeBob SquarePants\/S04\/433 Born to be Wild.mp4"},{"file":"434 Best Frenemies.mp4","epTitle":"434 Best Frenemies","filePath":"videos\/SpongeBob SquarePants\/S04\/434 Best Frenemies.mp4"},{"file":"435 The Pink Purloiner.mp4","epTitle":"435 The Pink Purloiner","filePath":"videos\/SpongeBob SquarePants\/S04\/435 The Pink Purloiner.mp4"},{"file":"436 Squid Wood.mp4","epTitle":"436 Squid Wood","filePath":"videos\/SpongeBob SquarePants\/S04\/436 Squid Wood.mp4"},{"file":"437 Best Day Ever.mp4","epTitle":"437 Best Day Ever","filePath":"videos\/SpongeBob SquarePants\/S04\/437 Best Day Ever.mp4"},{"file":"438 The Gift of Gum.mp4","epTitle":"438 The Gift of Gum","filePath":"videos\/SpongeBob SquarePants\/S04\/438 The Gift of Gum.mp4"}],[{"file":"501 Friend or Foe.mp4","epTitle":"501 Friend or Foe","filePath":"videos\/SpongeBob SquarePants\/S05\/501 Friend or Foe.mp4"},{"file":"502 The Original Fry Cook.mp4","epTitle":"502 The Original Fry Cook","filePath":"videos\/SpongeBob SquarePants\/S05\/502 The Original Fry Cook.mp4"},{"file":"503 Night Light.mp4","epTitle":"503 Night Light","filePath":"videos\/SpongeBob SquarePants\/S05\/503 Night Light.mp4"},{"file":"504 Rise and Shine.mp4","epTitle":"504 Rise and Shine","filePath":"videos\/SpongeBob SquarePants\/S05\/504 Rise and Shine.mp4"},{"file":"505 Waiting....mp4","epTitle":"505 Waiting...","filePath":"videos\/SpongeBob SquarePants\/S05\/505 Waiting....mp4"},{"file":"506 Fungus Among Us.mp4","epTitle":"506 Fungus Among Us","filePath":"videos\/SpongeBob SquarePants\/S05\/506 Fungus Among Us.mp4"},{"file":"507 Spy Buddies.mp4","epTitle":"507 Spy Buddies","filePath":"videos\/SpongeBob SquarePants\/S05\/507 Spy Buddies.mp4"},{"file":"508 Boat Smarts.mp4","epTitle":"508 Boat Smarts","filePath":"videos\/SpongeBob SquarePants\/S05\/508 Boat Smarts.mp4"},{"file":"509 Good Ol\' Whatshisname.mp4","epTitle":"509 Good Ol\' Whatshisname","filePath":"videos\/SpongeBob SquarePants\/S05\/509 Good Ol\' Whatshisname.mp4"},{"file":"510 New Digs.mp4","epTitle":"510 New Digs","filePath":"videos\/SpongeBob SquarePants\/S05\/510 New Digs.mp4"},{"file":"511 Krabs a la Mode.mp4","epTitle":"511 Krabs a la Mode","filePath":"videos\/SpongeBob SquarePants\/S05\/511 Krabs a la Mode.mp4"},{"file":"512 Roller Cowards.mp4","epTitle":"512 Roller Cowards","filePath":"videos\/SpongeBob SquarePants\/S05\/512 Roller Cowards.mp4"},{"file":"513 Bucket Sweet Bucket.mp4","epTitle":"513 Bucket Sweet Bucket","filePath":"videos\/SpongeBob SquarePants\/S05\/513 Bucket Sweet Bucket.mp4"},{"file":"514 To Love a Patty.mp4","epTitle":"514 To Love a Patty","filePath":"videos\/SpongeBob SquarePants\/S05\/514 To Love a Patty.mp4"},{"file":"515 Breath of Fresh Squidward.mp4","epTitle":"515 Breath of Fresh Squidward","filePath":"videos\/SpongeBob SquarePants\/S05\/515 Breath of Fresh Squidward.mp4"},{"file":"516 Money Talks.mp4","epTitle":"516 Money Talks","filePath":"videos\/SpongeBob SquarePants\/S05\/516 Money Talks.mp4"},{"file":"517 Spongebob vs. The Patty Gadget.mp4","epTitle":"517 Spongebob vs. The Patty Gadget","filePath":"videos\/SpongeBob SquarePants\/S05\/517 Spongebob vs. The Patty Gadget.mp4"},{"file":"518 Slimy Dancing.mp4","epTitle":"518 Slimy Dancing","filePath":"videos\/SpongeBob SquarePants\/S05\/518 Slimy Dancing.mp4"},{"file":"519 The Krusty Sponge.mp4","epTitle":"519 The Krusty Sponge","filePath":"videos\/SpongeBob SquarePants\/S05\/519 The Krusty Sponge.mp4"},{"file":"520 Sing a Song of Patrick.mp4","epTitle":"520 Sing a Song of Patrick","filePath":"videos\/SpongeBob SquarePants\/S05\/520 Sing a Song of Patrick.mp4"},{"file":"521 A Flea in Her Dome.mp4","epTitle":"521 A Flea in Her Dome","filePath":"videos\/SpongeBob SquarePants\/S05\/521 A Flea in Her Dome.mp4"},{"file":"522 The Donut of Shame.mp4","epTitle":"522 The Donut of Shame","filePath":"videos\/SpongeBob SquarePants\/S05\/522 The Donut of Shame.mp4"},{"file":"523 The Krusty Plate.mp4","epTitle":"523 The Krusty Plate","filePath":"videos\/SpongeBob SquarePants\/S05\/523 The Krusty Plate.mp4"},{"file":"524 Goo Goo Gas.mp4","epTitle":"524 Goo Goo Gas","filePath":"videos\/SpongeBob SquarePants\/S05\/524 Goo Goo Gas.mp4"},{"file":"525 Le Big Switch.mp4","epTitle":"525 Le Big Switch","filePath":"videos\/SpongeBob SquarePants\/S05\/525 Le Big Switch.mp4"},{"file":"526 Atlantis SquarePantis.mp4","epTitle":"526 Atlantis SquarePantis","filePath":"videos\/SpongeBob SquarePants\/S05\/526 Atlantis SquarePantis.mp4"},{"file":"527 Picture Day.mp4","epTitle":"527 Picture Day","filePath":"videos\/SpongeBob SquarePants\/S05\/527 Picture Day.mp4"},{"file":"528 Pat No Pay.mp4","epTitle":"528 Pat No Pay","filePath":"videos\/SpongeBob SquarePants\/S05\/528 Pat No Pay.mp4"},{"file":"529 Blackjack.mp4","epTitle":"529 Blackjack","filePath":"videos\/SpongeBob SquarePants\/S05\/529 Blackjack.mp4"},{"file":"530 Blackened Sponge.mp4","epTitle":"530 Blackened Sponge","filePath":"videos\/SpongeBob SquarePants\/S05\/530 Blackened Sponge.mp4"},{"file":"531 Mermaidman vs. Spongebob.mp4","epTitle":"531 Mermaidman vs. Spongebob","filePath":"videos\/SpongeBob SquarePants\/S05\/531 Mermaidman vs. Spongebob.mp4"},{"file":"532 The Inmates of Summer.mp4","epTitle":"532 The Inmates of Summer","filePath":"videos\/SpongeBob SquarePants\/S05\/532 The Inmates of Summer.mp4"},{"file":"533 To Save a Squirrel.mp4","epTitle":"533 To Save a Squirrel","filePath":"videos\/SpongeBob SquarePants\/S05\/533 To Save a Squirrel.mp4"},{"file":"534 Pest of the West.mp4","epTitle":"534 Pest of the West","filePath":"videos\/SpongeBob SquarePants\/S05\/534 Pest of the West.mp4"},{"file":"535 20,000 Patties Under the Sea.mp4","epTitle":"535 20,000 Patties Under the Sea","filePath":"videos\/SpongeBob SquarePants\/S05\/535 20,000 Patties Under the Sea.mp4"},{"file":"536 The Battle of Bikini Bottom.mp4","epTitle":"536 The Battle of Bikini Bottom","filePath":"videos\/SpongeBob SquarePants\/S05\/536 The Battle of Bikini Bottom.mp4"},{"file":"537 The Two Faces of Squidward.mp4","epTitle":"537 The Two Faces of Squidward","filePath":"videos\/SpongeBob SquarePants\/S05\/537 The Two Faces of Squidward.mp4"},{"file":"538 Whatever Happened to Spongebob.mp4","epTitle":"538 Whatever Happened to Spongebob","filePath":"videos\/SpongeBob SquarePants\/S05\/538 Whatever Happened to Spongebob.mp4"},{"file":"539 Spongehenge.mp4","epTitle":"539 Spongehenge","filePath":"videos\/SpongeBob SquarePants\/S05\/539 Spongehenge.mp4"},{"file":"540 Banned in Bikini Bottom.mp4","epTitle":"540 Banned in Bikini Bottom","filePath":"videos\/SpongeBob SquarePants\/S05\/540 Banned in Bikini Bottom.mp4"},{"file":"541 Stanley S. SquarePants.mp4","epTitle":"541 Stanley S. SquarePants","filePath":"videos\/SpongeBob SquarePants\/S05\/541 Stanley S. SquarePants.mp4"}],[{"file":"601 House Fancy.mp4","epTitle":"601 House Fancy","filePath":"videos\/SpongeBob SquarePants\/S06\/601 House Fancy.mp4"},{"file":"602 Krabby Road.mp4","epTitle":"602 Krabby Road","filePath":"videos\/SpongeBob SquarePants\/S06\/602 Krabby Road.mp4"},{"file":"603 Penny Foolish.mp4","epTitle":"603 Penny Foolish","filePath":"videos\/SpongeBob SquarePants\/S06\/603 Penny Foolish.mp4"},{"file":"604 Nautical Novice.mp4","epTitle":"604 Nautical Novice","filePath":"videos\/SpongeBob SquarePants\/S06\/604 Nautical Novice.mp4"},{"file":"605 Spongicus.mp4","epTitle":"605 Spongicus","filePath":"videos\/SpongeBob SquarePants\/S06\/605 Spongicus.mp4"},{"file":"606 Suction Cup Symphony.mp4","epTitle":"606 Suction Cup Symphony","filePath":"videos\/SpongeBob SquarePants\/S06\/606 Suction Cup Symphony.mp4"},{"file":"607 Not Normal.mp4","epTitle":"607 Not Normal","filePath":"videos\/SpongeBob SquarePants\/S06\/607 Not Normal.mp4"},{"file":"608 Gone.mp4","epTitle":"608 Gone","filePath":"videos\/SpongeBob SquarePants\/S06\/608 Gone.mp4"},{"file":"609 The Splinter.mp4","epTitle":"609 The Splinter","filePath":"videos\/SpongeBob SquarePants\/S06\/609 The Splinter.mp4"},{"file":"610 Slide Whistle Stooges.mp4","epTitle":"610 Slide Whistle Stooges","filePath":"videos\/SpongeBob SquarePants\/S06\/610 Slide Whistle Stooges.mp4"},{"file":"611 A Life in a Day.mp4","epTitle":"611 A Life in a Day","filePath":"videos\/SpongeBob SquarePants\/S06\/611 A Life in a Day.mp4"},{"file":"612 Sun Bleached.mp4","epTitle":"612 Sun Bleached","filePath":"videos\/SpongeBob SquarePants\/S06\/612 Sun Bleached.mp4"},{"file":"613 Giant Squidward.mp4","epTitle":"613 Giant Squidward","filePath":"videos\/SpongeBob SquarePants\/S06\/613 Giant Squidward.mp4"},{"file":"614 No Nose Knows.mp4","epTitle":"614 No Nose Knows","filePath":"videos\/SpongeBob SquarePants\/S06\/614 No Nose Knows.mp4"},{"file":"616 Plankton\'s Regular.mp4","epTitle":"616 Plankton\'s Regular","filePath":"videos\/SpongeBob SquarePants\/S06\/616 Plankton\'s Regular.mp4"},{"file":"617 Boating Buddies.mp4","epTitle":"617 Boating Buddies","filePath":"videos\/SpongeBob SquarePants\/S06\/617 Boating Buddies.mp4"},{"file":"618 The Krabby Kronicle.mp4","epTitle":"618 The Krabby Kronicle","filePath":"videos\/SpongeBob SquarePants\/S06\/618 The Krabby Kronicle.mp4"},{"file":"619 The Slumber Party.mp4","epTitle":"619 The Slumber Party","filePath":"videos\/SpongeBob SquarePants\/S06\/619 The Slumber Party.mp4"},{"file":"620 Grooming Gary.mp4","epTitle":"620 Grooming Gary","filePath":"videos\/SpongeBob SquarePants\/S06\/620 Grooming Gary.mp4"},{"file":"621 Spongebob vs. The Big One.mp4","epTitle":"621 Spongebob vs. The Big One","filePath":"videos\/SpongeBob SquarePants\/S06\/621 Spongebob vs. The Big One.mp4"},{"file":"623 Choir Boys.mp4","epTitle":"623 Choir Boys","filePath":"videos\/SpongeBob SquarePants\/S06\/623 Choir Boys.mp4"},{"file":"624 Krusty Krushers.mp4","epTitle":"624 Krusty Krushers","filePath":"videos\/SpongeBob SquarePants\/S06\/624 Krusty Krushers.mp4"},{"file":"625 The Card.mp4","epTitle":"625 The Card","filePath":"videos\/SpongeBob SquarePants\/S06\/625 The Card.mp4"},{"file":"626 Dear Vikings.mp4","epTitle":"626 Dear Vikings","filePath":"videos\/SpongeBob SquarePants\/S06\/626 Dear Vikings.mp4"},{"file":"628 Grandpappy the Pirate.mp4","epTitle":"628 Grandpappy the Pirate","filePath":"videos\/SpongeBob SquarePants\/S06\/628 Grandpappy the Pirate.mp4"},{"file":"629 Cephalopod Lodge.mp4","epTitle":"629 Cephalopod Lodge","filePath":"videos\/SpongeBob SquarePants\/S06\/629 Cephalopod Lodge.mp4"},{"file":"630 Squid\'s Visit.mp4","epTitle":"630 Squid\'s Visit","filePath":"videos\/SpongeBob SquarePants\/S06\/630 Squid\'s Visit.mp4"},{"file":"631 To SquarePants or Not to SquarePants.mp4","epTitle":"631 To SquarePants or Not to SquarePants","filePath":"videos\/SpongeBob SquarePants\/S06\/631 To SquarePants or Not to SquarePants.mp4"},{"file":"632 Shuffleboarding.mp4","epTitle":"632 Shuffleboarding","filePath":"videos\/SpongeBob SquarePants\/S06\/632 Shuffleboarding.mp4"},{"file":"633 Professor Squidward.mp4","epTitle":"633 Professor Squidward","filePath":"videos\/SpongeBob SquarePants\/S06\/633 Professor Squidward.mp4"},{"file":"635 Komputer Overload.mp4","epTitle":"635 Komputer Overload","filePath":"videos\/SpongeBob SquarePants\/S06\/635 Komputer Overload.mp4"},{"file":"636 Gullible Pants.mp4","epTitle":"636 Gullible Pants","filePath":"videos\/SpongeBob SquarePants\/S06\/636 Gullible Pants.mp4"},{"file":"637 Overbooked.mp4","epTitle":"637 Overbooked","filePath":"videos\/SpongeBob SquarePants\/S06\/637 Overbooked.mp4"},{"file":"638 No Hat for Pat.mp4","epTitle":"638 No Hat for Pat","filePath":"videos\/SpongeBob SquarePants\/S06\/638 No Hat for Pat.mp4"},{"file":"639 Toy Store of Doom.mp4","epTitle":"639 Toy Store of Doom","filePath":"videos\/SpongeBob SquarePants\/S06\/639 Toy Store of Doom.mp4"}],[{"file":"701 Sand Castles in the Sand.mp4","epTitle":"701 Sand Castles in the Sand","filePath":"videos\/SpongeBob SquarePants\/S07\/701 Sand Castles in the Sand.mp4"},{"file":"702 Shell Shocked.mp4","epTitle":"702 Shell Shocked","filePath":"videos\/SpongeBob SquarePants\/S07\/702 Shell Shocked.mp4"},{"file":"703 Chum Bucket Supreme.mp4","epTitle":"703 Chum Bucket Supreme","filePath":"videos\/SpongeBob SquarePants\/S07\/703 Chum Bucket Supreme.mp4"},{"file":"704 Single Cell Anniversary.mp4","epTitle":"704 Single Cell Anniversary","filePath":"videos\/SpongeBob SquarePants\/S07\/704 Single Cell Anniversary.mp4"},{"file":"705 Truth or Square.mp4","epTitle":"705 Truth or Square","filePath":"videos\/SpongeBob SquarePants\/S07\/705 Truth or Square.mp4"},{"file":"706 Pineapple Fever.mp4","epTitle":"706 Pineapple Fever","filePath":"videos\/SpongeBob SquarePants\/S07\/706 Pineapple Fever.mp4"},{"file":"707 Chum Caverns.mp4","epTitle":"707 Chum Caverns","filePath":"videos\/SpongeBob SquarePants\/S07\/707 Chum Caverns.mp4"},{"file":"708 The Clash of Triton.mp4","epTitle":"708 The Clash of Triton","filePath":"videos\/SpongeBob SquarePants\/S07\/708 The Clash of Triton.mp4"},{"file":"709 Tentacle Vision.mp4","epTitle":"709 Tentacle Vision","filePath":"videos\/SpongeBob SquarePants\/S07\/709 Tentacle Vision.mp4"},{"file":"710 I Heart Dancing.mp4","epTitle":"710 I Heart Dancing","filePath":"videos\/SpongeBob SquarePants\/S07\/710 I Heart Dancing.mp4"},{"file":"711 Growth Spout.mp4","epTitle":"711 Growth Spout","filePath":"videos\/SpongeBob SquarePants\/S07\/711 Growth Spout.mp4"},{"file":"712 Stuck in the Wringer.mp4","epTitle":"712 Stuck in the Wringer","filePath":"videos\/SpongeBob SquarePants\/S07\/712 Stuck in the Wringer.mp4"},{"file":"713 Someone\'s in the Kitchen with Sandy.mp4","epTitle":"713 Someone\'s in the Kitchen with Sandy","filePath":"videos\/SpongeBob SquarePants\/S07\/713 Someone\'s in the Kitchen with Sandy.mp4"},{"file":"714 The Inside Job.mp4","epTitle":"714 The Inside Job","filePath":"videos\/SpongeBob SquarePants\/S07\/714 The Inside Job.mp4"},{"file":"715 Greasy Buffoons.mp4","epTitle":"715 Greasy Buffoons","filePath":"videos\/SpongeBob SquarePants\/S07\/715 Greasy Buffoons.mp4"},{"file":"716 Model Sponge.mp4","epTitle":"716 Model Sponge","filePath":"videos\/SpongeBob SquarePants\/S07\/716 Model Sponge.mp4"},{"file":"717 Keep Bikini Bottom Beautiful.mp4","epTitle":"717 Keep Bikini Bottom Beautiful","filePath":"videos\/SpongeBob SquarePants\/S07\/717 Keep Bikini Bottom Beautiful.mp4"},{"file":"718 A Pal for Gary.mp4","epTitle":"718 A Pal for Gary","filePath":"videos\/SpongeBob SquarePants\/S07\/718 A Pal for Gary.mp4"},{"file":"719 Yours, Mine and Mine.mp4","epTitle":"719 Yours, Mine and Mine","filePath":"videos\/SpongeBob SquarePants\/S07\/719 Yours, Mine and Mine.mp4"},{"file":"720 Kracked Krabs.mp4","epTitle":"720 Kracked Krabs","filePath":"videos\/SpongeBob SquarePants\/S07\/720 Kracked Krabs.mp4"},{"file":"721 The Curse of Bikini Bottom.mp4","epTitle":"721 The Curse of Bikini Bottom","filePath":"videos\/SpongeBob SquarePants\/S07\/721 The Curse of Bikini Bottom.mp4"},{"file":"722 Squidward in Clarinetland.mp4","epTitle":"722 Squidward in Clarinetland","filePath":"videos\/SpongeBob SquarePants\/S07\/722 Squidward in Clarinetland.mp4"},{"file":"723 SpongeBob\'s Last Stand.mp4","epTitle":"723 SpongeBob\'s Last Stand","filePath":"videos\/SpongeBob SquarePants\/S07\/723 SpongeBob\'s Last Stand.mp4"},{"file":"724 Back to the Past.mp4","epTitle":"724 Back to the Past","filePath":"videos\/SpongeBob SquarePants\/S07\/724 Back to the Past.mp4"},{"file":"725 The Bad Guy Club for Villains.mp4","epTitle":"725 The Bad Guy Club for Villains","filePath":"videos\/SpongeBob SquarePants\/S07\/725 The Bad Guy Club for Villains.mp4"},{"file":"726 A Day without Tears.mp4","epTitle":"726 A Day without Tears","filePath":"videos\/SpongeBob SquarePants\/S07\/726 A Day without Tears.mp4"},{"file":"727 Summer Job.mp4","epTitle":"727 Summer Job","filePath":"videos\/SpongeBob SquarePants\/S07\/727 Summer Job.mp4"},{"file":"728 Gary in Love.mp4","epTitle":"728 Gary in Love","filePath":"videos\/SpongeBob SquarePants\/S07\/728 Gary in Love.mp4"},{"file":"729 One Coarse Meal.mp4","epTitle":"729 One Coarse Meal","filePath":"videos\/SpongeBob SquarePants\/S07\/729 One Coarse Meal.mp4"},{"file":"730 The Play\'s the Thing.mp4","epTitle":"730 The Play\'s the Thing","filePath":"videos\/SpongeBob SquarePants\/S07\/730 The Play\'s the Thing.mp4"},{"file":"731 Rodeo Daze.mp4","epTitle":"731 Rodeo Daze","filePath":"videos\/SpongeBob SquarePants\/S07\/731 Rodeo Daze.mp4"},{"file":"732 Gramma\'s Secret Recipe.mp4","epTitle":"732 Gramma\'s Secret Recipe","filePath":"videos\/SpongeBob SquarePants\/S07\/732 Gramma\'s Secret Recipe.mp4"},{"file":"733 The Cent of Money.mp4","epTitle":"733 The Cent of Money","filePath":"videos\/SpongeBob SquarePants\/S07\/733 The Cent of Money.mp4"},{"file":"734 The Monster Who Came to Bikini Bottom.mp4","epTitle":"734 The Monster Who Came to Bikini Bottom","filePath":"videos\/SpongeBob SquarePants\/S07\/734 The Monster Who Came to Bikini Bottom.mp4"},{"file":"735 Welcome to the Bikini Bottom Triangle.mp4","epTitle":"735 Welcome to the Bikini Bottom Triangle","filePath":"videos\/SpongeBob SquarePants\/S07\/735 Welcome to the Bikini Bottom Triangle.mp4"},{"file":"736 The Curse of the Hex.mp4","epTitle":"736 The Curse of the Hex","filePath":"videos\/SpongeBob SquarePants\/S07\/736 The Curse of the Hex.mp4"},{"file":"737 The Main Drain.mp4","epTitle":"737 The Main Drain","filePath":"videos\/SpongeBob SquarePants\/S07\/737 The Main Drain.mp4"},{"file":"738 Trenchbillies.mp4","epTitle":"738 Trenchbillies","filePath":"videos\/SpongeBob SquarePants\/S07\/738 Trenchbillies.mp4"},{"file":"739 Sponge-Cano.mp4","epTitle":"739 Sponge-Cano","filePath":"videos\/SpongeBob SquarePants\/S07\/739 Sponge-Cano.mp4"},{"file":"740 The Great Patty Caper.mp4","epTitle":"740 The Great Patty Caper","filePath":"videos\/SpongeBob SquarePants\/S07\/740 The Great Patty Caper.mp4"},{"file":"741 That Sinking Feeling.mp4","epTitle":"741 That Sinking Feeling","filePath":"videos\/SpongeBob SquarePants\/S07\/741 That Sinking Feeling.mp4"},{"file":"742 Karate Star.mp4","epTitle":"742 Karate Star","filePath":"videos\/SpongeBob SquarePants\/S07\/742 Karate Star.mp4"}],[{"file":"801 Buried in Time.mp4","epTitle":"801 Buried in Time","filePath":"videos\/SpongeBob SquarePants\/S08\/801 Buried in Time.mp4"},{"file":"802 Enchanted Tiki Dreams.mp4","epTitle":"802 Enchanted Tiki Dreams","filePath":"videos\/SpongeBob SquarePants\/S08\/802 Enchanted Tiki Dreams.mp4"},{"file":"805 Hide And Then What Happens.mp4","epTitle":"805 Hide And Then What Happens","filePath":"videos\/SpongeBob SquarePants\/S08\/805 Hide And Then What Happens.mp4"},{"file":"807 The Masterpiece.mp4","epTitle":"807 The Masterpiece","filePath":"videos\/SpongeBob SquarePants\/S08\/807 The Masterpiece.mp4"},{"file":"808 Whelk Attack.mp4","epTitle":"808 Whelk Attack","filePath":"videos\/SpongeBob SquarePants\/S08\/808 Whelk Attack.mp4"},{"file":"809 You Dont Know Sponge.mp4","epTitle":"809 You Dont Know Sponge","filePath":"videos\/SpongeBob SquarePants\/S08\/809 You Dont Know Sponge.mp4"},{"file":"810 Tunnel Of Glove.mp4","epTitle":"810 Tunnel Of Glove","filePath":"videos\/SpongeBob SquarePants\/S08\/810 Tunnel Of Glove.mp4"},{"file":"815 Big Sister Sam.mp4","epTitle":"815 Big Sister Sam","filePath":"videos\/SpongeBob SquarePants\/S08\/815 Big Sister Sam.mp4"}]]}]';
	    return JSON.parse(str); 
	}());
	//load video list
	window.videoList = (function generateVideosList(showsList){
    	var ul = $('<ul></ul>').attr('id', 'accordion');
    	for(var i = 0; i < showsList.length; i++){
    		var seriesName = showsList[i].seriesName;
    		var seasons = showsList[i].seasons;
    		var li = $('<li>' + seriesName + '</li>');
    		for(var j = 0; j < seasons; j++){
    			var ul2 = $('<ul>Season '+ (j+1) +'</ul>');
    			for(var k = 0; k < showsList[i].episodes[j].length; k++){
    				var ep = showsList[i].episodes[j][k];
    				var epTitle = ep.epTitle;
    				var path = ep.filePath;
    				
    				var li2 = $('<li></li>');
    				var a = $('<a>'+ epTitle + '</a>')
    						.attr('href', 'videoPlayer.php?play=' + path)
    						.attr('target', '_blank')
    						.addClass('video-link')
    						.data('path', path)
    						.click(function(){
    							window.settingsObj.changeCoins(-1);
    							$('#video-list-container').hide();
    							//var record = JSON.stringify(user);
    							//docCookies.setItem('record', record);
    							$('#timer').show();
    						});
    				li2.append(a);
    				ul2.append(li2);
    			}			
    			li.append(ul2);
    		}
    		ul.append(li);
    	}
    	return ul;
    }(listObj));
}());


$(document).ready(function(){
    $('#video-list-container').hide();
    $('#controls').hide();
    $('#numpad').hide();
    
    
    /********** KEYBOARD SHORTCUTS   **********/
    // For all inputs and contenteditable div, 
    // pressing Enter will find the submit button and click it
    // pressing ESC will erase the answer
    $('input, div[contenteditable]').keydown(function(e){
        if(e.which == 13){
            $(this).siblings('.button').click();
        } else if(e.which == 27){
            $(this).text('');
        }
    });
    
	if(Problem.loaderContent){
		var content = Problem.loaderContent();
		var currHTML = $('#problem-loader-container').html();
		$('#problem-loader-container').html(currHTML + content);
		$('#show-problem-loader').click(function(){
			$('#problem-loader-container').show();
		}).show();
	}
    
    PointsSetting.renderPointBoxes();
    PointsSetting.loadSetting();
	PointsSetting.renderState();
	
	$('.input').keydown(function(e){
		if(e.which == 13){
			e.preventDefault();
		}
	});
	
	$('.close-container').click(function(){
	    $(this).closest('.container').hide();
	})
	
	$('#show-settings').click(function(){
		$('#submit-settings').toggle().css('display', 'inline-block');
		$('#settings-wrapper').toggle();
	});
	
	$('#show-controls').click(function(){
        // SHOW CURRENT SETTING!!!!!!!!!!!!!!!!!!
		$('#controls').toggle();
	});
	
	$('#close-controls').click(function(){
		$('#controls').hide();	
		$('#settings-wrapper').hide();	
	});

	$('#submit-settings').click(function(){
		var pw = $('#password').val();
		var data = $('#password').data('password');
		if(pw == data){
            
            //ASK "LOAD NEW PROBLEM?" OR 'MUST LOAD NEW PROBLEM'
            // OR SOMETHING LIKE THAT
		}
	});
	
	$('#close-video-list-container').click(function(){
		$('#video-list-container').hide();	
	});
	

	
	$('#show-video-list-container').click(function(){
		if(PointsSetting.getCoins() > 0){
			$('#video-list-container').toggle();
		} else {
			alert('You don\'t have enough coins!');
		}
	});
	
	$('#new-problem').click(function(){
		Problem.newProblem();
	});
	
	$('body').on('keydown', '.input', function(e){
		if(e.which == 27){
			$(this).text('');
		} else if(e.which == 13){
		    e.preventDefault();
			Problem.checkAnswer();
		}
	});
	$('#video-list-container').append(videoList);
});


