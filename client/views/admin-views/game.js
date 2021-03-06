/**
 * =============================================================
 * DATA CONTEXT
 * Template data: none
 * Router subscriptions: none
 * Template subscriptions: none
 * =============================================================
 */

/**
 * =============================================================
 * TEMPLATE CREATED
 * =============================================================
 */
Template.gamePlay.onCreated(function(){
    this.timer;
    var self = this;
    self.roomId = Bolt.Collections.Games.findOne(self.data._id).roomId;
    this.countdown = function( elementName, minutes, seconds ){
        // console.log(minutes,seconds);
        clearTimeout( self.timer );
        elementName = elementName || "countdown";
        if( !minutes && minutes !== 0 ){
            minutes = 60;
        }
        seconds = seconds || 0;



        var element, endTime, hours, mins, msLeft, time;

        function twoDigits( n )
        {
            return (n <= 9 ? "0" + n : n);
        }

        function updateTimer()
        {
            // console.log(self.roomId);
            msLeft = endTime - (+new Date);
            if ( msLeft < 1000 ) {
                element.innerHTML = "0:00";
            } else {
                time = new Date( msLeft );
                hours = time.getUTCHours();
                mins = time.getUTCMinutes();
                secs = twoDigits( time.getUTCSeconds() );
                element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
                self.timer = setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
                // if( secs == 50 ){
                //     document.getElementById('news').innerHTML = "COULD SINK TIKI ISLAND";
                // }else if( secs == 40 ){
                //     document.getElementById('news').innerHTML = "ERUPTION TO TRIGGER CHAIN REACTION";
                // }else if( secs == 30 ){
                //     document.getElementById('news').innerHTML = "AND CAUSE MORE VOLCANO ERUPTIONS";
                // }else if( secs == 20 ){
                //     document.getElementById('news').innerHTML = "ALL ACROSS PACIFIC RIM";
                // }else if( secs == 10 ){
                //     document.getElementById('news').innerHTML = "1 BILLION PEOPLE COULD DIE!";
                // }else{
                //     document.getElementById('news').innerHTML = document.getElementById('news').innerHTML + ".";
                // }
                // // console.log('in updateTimer', parseInt(msLeft/1000));
                if(self.roomId === "3uvLANaxBvEfH4ZLH") {
                    // console.log('in cottl');
                    if (2400 === parseInt(msLeft / 1000)) {

                        alert('Do not forget to place the doll in the cave!');
                    }

                }

            }


        }

        element = document.getElementById( elementName );
        endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
        updateTimer();
    };

});

/**
 * =============================================================
 * TEMPLATE RENDERED
 * =============================================================
 */
Template.gamePlay.onRendered(function(){
    //this.countdown();
    var self = this;
    var gameData = Bolt.Collections.Games.findOne(this.data._id);
    var game = new Bolt.Game(gameData);
    // // console.log( 'GAME', game );
    var resetDocReactive;
    if( game.roomId == "3uvLANaxBvEfH4ZLH" ){
        resetDocReactive = Bolt.Collections.tikiCountdownStatus.find().fetch();
    }else if ( game.roomId == "HBBzehj9W2BPjvomA" ){
        resetDocReactive = Bolt.Collections.seanceCountdownStatus.find().fetch();
    }
    var lastResetTime;
    if(resetDocReactive && resetDocReactive[0]){
        lastResetTime = resetDocReactive[0].resetTime;
    }
    var dateObject = new Date();
    var currentTime = dateObject.getTime();
    var secondsSinceLastReset = parseInt( ( currentTime - lastResetTime ) / 1000 );
    // // console.log( 'SECONDS SINCE LAST RESET', secondsSinceLastReset );
    if( secondsSinceLastReset < 3600 ){
        var secondsLeftOnCountdown = 3600 - secondsSinceLastReset;
        var countdownSeconds = secondsLeftOnCountdown % 60;
        var countdownMinutes = parseInt( Math.floor( secondsLeftOnCountdown / 60 ) );
        this.countdown( "countdown", countdownMinutes, countdownSeconds );
    }
    // this.autorun(function(){
    //     // console.log( 'SECONDS SINCE LAST RESET', secondsSinceLastReset );
    //     // console.log(Session.get('lastReset'));
    //     if( lastResetTime !== Session.get('lastReset') ){
    //         Session.set('lastReset',lastResetTime);
    //         clearTimeout(self.timer);
    //         self.countdown();
    //     }
    // });
});


/**
 * =============================================================
 * TEMPLATE DESTROYED
 * =============================================================
 */
Template.gamePlay.onDestroyed(function(){});

/**
 * =============================================================
 * TEMPLATE EVENTS
 * =============================================================
 */
Template.gamePlay.events({
    'submit form': function(evt,tmpl){

        evt.preventDefault();

        // console.log('sending message - 1/x');
        Notifications.info('Sending message...');

        // $('[type="submit"]').attr("disabled","disabled");
        var formData = Bureaucrat.getFormData($(evt.currentTarget));
        //// console.log('form data', formData, $('[name="device"]:checked').val() );
        // console.log('sending message - 3/x');

        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);

        // console.log('sending message - 3/x');

        if( game.roomId == "HBBzehj9W2BPjvomA" ){
            // alert('SEANCE');
            //// console.log(response);
            // console.log('sending message - seance???/x');

            if (!game.messages) {
                game.messages = []
            }
            game.messages.push({body:formData.message,dateCreated:new Date()});
            var ok = game.save();
            if( ok ){
                $('textarea').val('');
                Notifications.success('Message sent');

            }else{
                Notifications.error( 'could not send message' );
            }
            $('[type="submit"]').removeAttr("disabled");

        }else {

            // console.log('sending message - 4/x');

            // Configure the Twilio client
            Meteor.call('sendSMS', formData.message, $('[name="device"]:checked').val(), function (error, response) {
                if (error) {
                    //// console.log( error );
                    // console.log('sending message - 6/x');

                    Notifications.error(error.message);

                } else {

                    // console.log('sending message - 7/x');
                    //// console.log(response);
                    var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
                    var game = new Bolt.Game(gameData);
                    if (!game.messages) {
                        game.messages = []
                    }
                    game.messages.push(response);
                    // console.log('sending message - 8/x');

                    game.save();
                    // console.log('sending message - 9/x');

                    $('textarea').val('');

                    Notifications.success('Message sent');

                    // console.log('sending message - 10/x');

                }
                $('[type="submit"]').removeAttr("disabled");

            });

            // console.log('sending message - 5/x');


        }

    },

    'change [hook="set-game-result"]': function(evt,tmpl){
        var won = $(evt.currentTarget).attr('hook-data-result') == "won" ? true : false;
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        game.won = won;
        if( game.save() ){
            Notifications.success( "Game result saved." );
        }else{
            Notifications.error( "Error", "Game result NOT saved." );
        }

    },
    'click [hook="set-game-time"]': function(evt,tmpl){
        evt.preventDefault();
        var gameTime = $('[hook="game-time"]').val();
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        game.timeLog = gameTime;
        if( game.save() ){
            Notifications.success( "Game time saved." );
        }else{
            Notifications.error( "Error", "Game time NOT saved." );
        }
    },
    'click [hook="send-follow-up"]': function(evt,tmpl) {
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        game.sendFollowUpEmail();
    },
    'click [hook="send-intro"]': function(evt,tmpl) {
        Notifications.info("Sending intro");
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);

        var room = Bolt.Collections.Rooms.findOne(game.roomId);
        Meteor.call('sendSMS', room.intro, $('[name="device"]:checked').val(), function(error,response){
            if( error ){
                Notifications.error("Intro NOT sent.");
                throw new Meteor.Error("Game|click|send-intro",error.message);
            }else{
                if( !game.messages ){
                    game.messages = []
                }
                game.messages.push(response);
                game.save();
                Notifications.success("Intro sent.");
            }
        });

    },
    'click [hook="send-outro"]': function(evt,tmpl) {
        Notifications.info("Sending outro");
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);

        var room = Bolt.Collections.Rooms.findOne(game.roomId);
        Meteor.call('sendSMS', room.outro, $('[name="device"]:checked').val(), function(error,response){
            if( error ){
                Notifications.error("Outro NOT sent.");
                throw new Meteor.Error("Game|click|send-outro",error.message);
            }else{
                var gameData = Bolt.Collections.Games.findOne();
                var game = new Bolt.Game(gameData);
                if( !game.messages ){
                    game.messages = []
                }
                game.messages.push(response);
                game.save();
                Notifications.success("Outro sent.");
            }
        });

    },
    'click [hook="send-demo"]': function(evt,tmpl) {
        Notifications.info("Sending demo");
        Meteor.call('sendSMS', 'Example of message', $('[name="device"]:checked').val(), function(error,response){
            if( error ){
                Notifications.error("Demo NOT sent.");
                throw new Meteor.Error("Game|click|send-demo",error.message);
            }else{
                Notifications.success("Demo sent.");
            }
        });

    },
    'click [hook="start-timer"]': function(evt,tmpl) {

        evt.preventDefault();
        // Write to tikiCountdownStatus
        if( confirm( "WARNING! PLEASE CONFIRM:\nRESTART TIMER AT 60:00?") ) {
            var statusUpdated;
            var newResetTime = new Date().getTime();
            var countdownCollection;
            var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
            var game = new Bolt.Game(gameData);
            var roomName = "";

            if( game.roomId == "3uvLANaxBvEfH4ZLH" ){
                countdownCollection = Bolt.Collections.tikiCountdownStatus;
                roomName = "tiki";
                countdownCollection.update(
                    {_id: "HdbcttuYTtwWvGKoS"},
                    {$set: {room: roomName, resetTime: newResetTime}},
                    function (err, rows) {
                        if (err) {
                            // console.log(err);
                        } else {
                            statusUpdated = rows;
                            // // console.log( 'timer started', statusUpdated );
                            //Session.set('lastReset', newResetTime);
                            tmpl.countdown("countdown",60,0);
                        }
                    }
                );
            }else if( game.roomId == "WWXZxGLGvpr7NBRbf" ){
                console.log('SETTING TIMER FOR LC');
                countdownCollection = Bolt.Collections.lostContinentCountdownStatus;
                roomName = "lc";
                var result = countdownCollection.update(
                    {_id: "9ysA4o4hbaJz24kaM"},
                    {$set: {room: roomName, resetTime: newResetTime}},
                    function (err, rows) {
                        if (err) {
                            console.log(err);
                        } else {
                            statusUpdated = rows;
                            console.log( 'timer started', statusUpdated );
                            //Session.set('lastReset', newResetTime);
                            tmpl.countdown("countdown",60,0);
                        }
                    }
                );
                console.log(result);
            }else if( game.roomId == "HBBzehj9W2BPjvomA" ){
                countdownCollection = Bolt.Collections.seanceCountdownStatus;
                roomName = "seance";
                countdownCollection.update(
                    {_id: "CjkxgQJ2HkTpXntFa"},
                    {$set: {room: roomName, resetTime: newResetTime, gameId:game._id, playMusic:true}},
                    function (err, rows) {
                        if (err) {
                            // console.log(err);
                        } else {
                            statusUpdated = rows;
                            // // console.log( 'timer started', statusUpdated );
                            //Session.set('lastReset', newResetTime);
                            tmpl.countdown("countdown",60,0);
                        }
                    }
                );
            }

        }

    },
    /**
     * Add 1 minute to game clock
     * @param evt
     * @param tmpl
     */
    'click [hook="add-minute"]': function(evt,tmpl) {

        // Prevent default event behavior
        evt.preventDefault();

        // var countdownDocs = Bolt.Collections.tikiCountdownStatus.find({}).fetch();
        // var countdown = countdownDocs[0];
        // var newResetTime = countdown.resetTime + 60000;

        var collection;
        var updateId;
        var room;
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        if( game.roomId == "3uvLANaxBvEfH4ZLH" ){

            collection = Bolt.Collections.tikiCountdownStatus;
            updateId = 'HdbcttuYTtwWvGKoS';
            room = 'tiki';
        }else if( game.roomId == "WWXZxGLGvpr7NBRbf" ){

            collection = Bolt.Collections.lostContinentCountdownStatus;
            updateId = '9ysA4o4hbaJz24kaM';
            room = 'lc';
        }else if ( game.roomId == "HBBzehj9W2BPjvomA" ){
            collection = Bolt.Collections.seanceCountdownStatus;
            updateId = 'CjkxgQJ2HkTpXntFa';
            room = 'seance';
        }
        countdownDocs = collection.find({}).fetch();
        var countdown = countdownDocs[0];
        var newResetTime = countdown.resetTime + 60000;

        collection.update(
            {_id: updateId},
            {$set: {room: room, resetTime: newResetTime}},
            function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    statusUpdated = rows;
                    // // console.log( 'timer started', statusUpdated );
                    //Session.set('lastReset', newResetTime);
                    var dateObject = new Date();
                    var currentTime = dateObject.getTime();
                    var secondsSinceLastReset = parseInt( ( currentTime - newResetTime ) / 1000 );
                    // // console.log( 'SECONDS SINCE LAST RESET', secondsSinceLastReset );
                    if( secondsSinceLastReset < 4800 ){
                        var secondsLeftOnCountdown = 3600 - secondsSinceLastReset;
                        var countdownSeconds = secondsLeftOnCountdown % 60;
                        var countdownMinutes = parseInt( Math.floor( secondsLeftOnCountdown / 60 ) );
                        // // console.log( countdownMinutes, countdownSeconds );
                        tmpl.countdown( "countdown", countdownMinutes, countdownSeconds );
                    }
                }
            }
        );
    },
    /**
     * Remove minute
     * @param evt
     * @param tmpl
     */
    'click [hook="remove-minute"]': function(evt,tmpl){

        // Prevent default event behavior
        evt.preventDefault();

        // var countdownDocs = Bolt.Collections.tikiCountdownStatus.find({}).fetch();
        // var countdown = countdownDocs[0];
        // var newResetTime = countdown.resetTime + 60000;

        var collection;
        var updateId;
        var room;
        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        if( game.roomId == "3uvLANaxBvEfH4ZLH" ){

            collection = Bolt.Collections.tikiCountdownStatus;
            updateId = 'HdbcttuYTtwWvGKoS';
            room = 'tiki';
        }else if( game.roomId == "WWXZxGLGvpr7NBRbf" ){
            console.log('Removing time from LC');
            collection = Bolt.Collections.lostContinentCountdownStatus;
            updateId = '9ysA4o4hbaJz24kaM';
            room = 'lc';
        }else if ( game.roomId == "HBBzehj9W2BPjvomA" ){
            collection = Bolt.Collections.seanceCountdownStatus;
            updateId = 'CjkxgQJ2HkTpXntFa';
            room = 'seance';
        }
        countdownDocs = collection.find({}).fetch();
        var countdown = countdownDocs[0];
        var newResetTime = countdown.resetTime - 60000;

        collection.update(
            {_id: updateId},
            {$set: {room: room, resetTime: newResetTime}},
            function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    statusUpdated = rows;
                    console.log( 'minute removed?', statusUpdated );
                    //Session.set('lastReset', newResetTime);
                    var dateObject = new Date();
                    var currentTime = dateObject.getTime();
                    var secondsSinceLastReset = parseInt( ( currentTime - newResetTime ) / 1000 );
                    // // console.log( 'SECONDS SINCE LAST RESET', secondsSinceLastReset );
                    if( secondsSinceLastReset < 4800 ){
                        var secondsLeftOnCountdown = 3600 - secondsSinceLastReset;
                        var countdownSeconds = secondsLeftOnCountdown % 60;
                        var countdownMinutes = parseInt( Math.floor( secondsLeftOnCountdown / 60 ) );
                        // // console.log( countdownMinutes, countdownSeconds );
                        tmpl.countdown( "countdown", countdownMinutes, countdownSeconds );
                    }
                }
            }
        );

    },
    /**
     * Play shadow sequence for Lost Continent
     * @param evt
     * @param tmpl
     */
    'click [hook="start-shadow-sequence"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: start shadow sequence');
        if(confirm('Play TIKIAN VOYAGE Video?')) {
            console.log('Starting shadow sequence');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        playShadowSequence: true,
                    }

                }
            );
        }
    },

    /**
     * Remove shadow sequence / tiki voyage
     * and show timer
     * @param evt
     * @param tmpl
     */
    'click [hook="show-timer"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: show timer');
        if(confirm('REMOVE TIKI VOYAGE AND SHOW TIMER?')) {
            console.log('Showing timer');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        showTimer: true,
                    }

                }
            );
        }
    },

    /**
     * Start basecamp soundtrack
     * @param evt
     * @param tmpl
     */
    'click [hook="start-basecamp-music"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: start basecamp msuic');
        if(confirm('START basecamp SOUNDTRACK?')) {
            console.log('Starting basecamp soundtrack');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        playBasecampMusic: true,
                    }

                }
            );
        }
    },

    /**
     * Reload mu screen page
     * @param evt
     * @param tmpl
     */
    'click [hook="start-mu-screen"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        if(confirm('RESET Mu Screen?')) {
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        resetMuScreen: true,
                    }

                }
            );
        }
    },

    /**
     * Start mu soundtrack
     * @param evt
     * @param tmpl
     */
    'click [hook="start-mu-soundtrack"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: start mu soundtrack');
        if(confirm('PLAY LOUD SOUNDTRACK In Dig Site?')) {
            console.log('Starting mu soundtrack');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        playMuSoundtrack: true,
                    }

                }
            );
        }
    },

    /**
     * Lower mu soundtrack volume
     * @param evt
     * @param tmpl
     */
    'click [hook="lower-mu-soundtrack-volume"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: lower mu soundtrack');
        if(confirm('LOWER MU SOUNDTRACK?')) {
            console.log('Lowering mu soundtrack');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        lowerMuSoundtrackVolume: true,
                    }

                }
            );
        }
    },

    /**
     * Play loser audio
     * @param evt
     * @param tmpl
     */
    'click [hook="play-loser-audio"]': function(evt,tmpl){
        // Prevent default event behavior
        evt.preventDefault();

        console.log('Click: Play loser audio');
        if(confirm('PLAY LOSER AUDIO?')) {
            console.log('Playing loser audio');
            Bolt.Collections.lostContinentCountdownStatus.update(
                {
                    _id: "9ysA4o4hbaJz24kaM"
                },
                {
                    $set: {
                        playLoserAudio: true,
                    }

                }
            );
        }
    },



    /**
     * Play laser audio in seance room
     * @param evt
     * @param tmpl
     */
    'click [hook="play-laser-audio"]': function(evt,tmpl){

        // Prevent default event behavior
        evt.preventDefault();

        Bolt.Collections.seanceCountdownStatus.update(

            {
                _id: "CjkxgQJ2HkTpXntFa"
            },
            {
                $set: {
                    playLaserAudio: true
                }

            }

        );

        var gameData = Bolt.Collections.Games.findOne(tmpl.data._id);
        var game = new Bolt.Game(gameData);
        // if( game.roomId == "HBBzehj9W2BPjvomA" ){
            // alert('SEANCE');
            //// console.log(response);
            if (!game.messages) {
                game.messages = []
            }
            game.messages.push({body:"Quick! While the tutor cannot watch! Direct our red spirit light to the keyhole in the picture!",dateCreated:new Date()});
            var ok = game.save();
            if( ok ){
                $('textarea').val('');
                Notifications.success('Message sent');

            }else{
                Notifications.error( 'could not send message' );
            }
            // $('[type="submit"]').removeAttr("disabled");

        // }

    }
});


/**
 * =============================================================
 * TEMPLATE HELPERS
 * =============================================================
 */
Template.gamePlay.helpers({
    game: function(){
        var gameData = Bolt.Collections.Games.findOne(this._id);
        var game = new Bolt.Game(gameData);
        return game;
    },
    isTikiLounge: function(){
        var gameData = Bolt.Collections.Games.findOne(this._id);
        var game = new Bolt.Game(gameData);
        // // console.log('isTiki', game);
        return game.roomId == "3uvLANaxBvEfH4ZLH";
    },
    isLostContinent: function(){
        var gameData = Bolt.Collections.Games.findOne(this._id);
        var game = new Bolt.Game(gameData);
        // // console.log('isTiki', game);
        return game.roomId == "WWXZxGLGvpr7NBRbf";
    },
    isSeance: function(){
        var gameData = Bolt.Collections.Games.findOne(this._id);
        var game = new Bolt.Game(gameData);
        // // console.log('isTiki', game);
        return game.roomId == "HBBzehj9W2BPjvomA";
    },
    room: function(){
        var gameData = Bolt.Collections.Games.findOne(this._id);
        var game = new Bolt.Game(gameData);
        var room = Bolt.Collections.Rooms.findOne(game.roomId);
        return room;
    },
    nbPlayers: function(){
        var game =  new Bolt.Game({
            date: this.date,
            time: this.time,
            roomId: this.roomId
        });

        return game.getNbPlayers();
    },
    nbWaivers: function(){
        var game =  new Bolt.Game({
            date: this.date,
            time: this.time,
            roomId: this.roomId
        });

        return game.players ? game.players.length : 0;
    },
    messageCount: function(){
        var game =  new Bolt.Game({
            date: this.date,
            time: this.time,
            roomId: this.roomId
        });
        if( game.messages ){
            return game.messages.length;
        }else{
            return 0;
        }
    },
    gameResultLogged: function(){
        var game =  new Bolt.Game({
            date: this.date,
            time: this.time,
            roomId: this.roomId
        });
        return game.won === true || game.won === false;
    }
});
