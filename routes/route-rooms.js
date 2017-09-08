/**
 * ROOMS
 */
Router.route('/rooms', {
    name: 'rooms',
    sitemap: true,
    changefreq: 'monthly',
    priority: '0.9',
    ironMeta: true,
    waitOn: function(){
        return Meteor.subscribe( 'roomOverviewList' );
    },
    data: function(){
        return { settings: Bolt.Collections.Settings.findOne({settingType: 'global'}) };
    },
    meta: function(){
        var title = 'Our Escape Rooms - Kauai Escape Room - Escape Games, Puzzle Rooms';
        var description = "Our escape rooms: the missing scientist, the lost Elvis record, Pele's tiki lounge, and our mobile escape room.";
        var image = 'https://www.escaperoomkauai.com/images/social-banner-logo.png';
        return {
            title: title,
            description: description,
            keywords: 'kauai, escape room, escape game, puzzle room',
            canonical: 'https://www.escaperoomkauai.com/rooms',
            "og:title": title,
            "og:type": 'website',
            "og:url": 'https://www.escaperoomkauai.com/rooms',
            "og:description": description,
            "og:site_name": 'Kauai Escape Room',
            "og:image": image,
            "og:image:width": '1200',
            "og:image:height": '630',
            "twitter:card": 'summary_large_image',
            "twitter:site": '@kauaiescaperoom',
            "twitter:creator": '@kauaiescaperoom',
            "twitter:title": title,
            "twitter:description": description,
            "twitter:image": image
        }
    }
});