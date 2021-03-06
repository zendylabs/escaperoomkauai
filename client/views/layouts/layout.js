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
Template.layout.onCreated(function(){});

/**
 * =============================================================
 * TEMPLATE RENDERED
 * =============================================================
 */
Template.layout.onRendered(function(){
    $('#bs-example-navbar-collapse-2').on('show.bs.collapse', function (e) {
        $('body').addClass('menu-slider');
    });
    $('#bs-example-navbar-collapse-2').on('shown.bs.collapse', function (e) {
        $('body').addClass('in');
    })
    $('#bs-example-navbar-collapse-2').on('hide.bs.collapse', function (e) {
        $('body').removeClass('menu-slider');
    })
    $('#bs-example-navbar-collapse-2').on('hidden.bs.collapse', function (e) {
        $('body').removeClass('in');
    });

    $('#bs-example-navbar-collapse-2 li a').click(function(e){
        //$('body').removeClass('menu-slider');
        $('body, #bs-example-navbar-collapse-2').removeClass('in');
    })
});


/**
 * =============================================================
 * TEMPLATE DESTROYED
 * =============================================================
 */
Template.layout.onDestroyed(function(){});

/**
 * =============================================================
 * TEMPLATE EVENTS
 * =============================================================
 */
Template.layout.events({});


/**
 * =============================================================
 * TEMPLATE HELPERS
 * =============================================================
 */
Template.layout.helpers({
    settings: function () {
        return Bolt.Collections.Settings.findOne({settingType: 'global'});
    }
});