import './buffer';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import wakajs from 'wakajs';
import Gun from 'gun/gun';
import SEA from 'gun/sea';
import timegraph from 'gun/lib/time';
import steem from 'steem';
import AskSteem from 'asksteem';
import sc2sdk from 'sc2-sdk';
steem.api.setOptions({ url: 'https://api.steemit.com' });

console.log('Starting DTube APP')

FlowRouter.wait();
Meteor.startup(function(){
  console.log('DTube APP Started')
  Session.set('remoteSettings', Meteor.settings.public.remote)
  window.steem = steem
  window.Gun = Gun

  Session.set('lastHot', null)
  Session.set('lastTrending', null)
  Session.set('lastCreated', null)
  Session.set('lastBlogs', {})
  Session.set('tagDays', 7)
  Session.set('tagSortBy', 'net_votes')
  Session.set('tagDuration', 999999)

  //window.localIpfs = IpfsApi(Session.get('remoteSettings').uploadNodes[Session.get('remoteSettings').uploadNodes.length-1].node)
  // setInterval(function() {
  //   try {
  //     localIpfs.repo.stat(function(e,r) {
  //       if (e) {
  //         Session.set('localIpfs', false)
  //         return;
  //       }
  //       Session.set('localIpfs', r)
  //
  //       // using local gateway seems to make my internet very unstable and nothing works
  //       // Session.set('ipfsGateway', Session.get('remoteSettings').displayNodes[Session.get('remoteSettings').displayNodes.length - 1])
  //     })
  //   } catch(e) {
  //
  //   }
  //
  // }, 10000)

  

  // loading remote settings -- disabled
  // steem.api.getAccounts(['dtube'], function(err, result) {
  //   if (!result || !result[0]) return
  //   var jsonMeta = JSON.parse(result[0].json_metadata)
  //   if (jsonMeta.remoteSettings) {
  //     //Session.set('remoteSettings', jsonMeta.remoteSettings)
  //     if (jsonMeta.remoteSettings.upldr) {
  //       var rand = jsonMeta.remoteSettings.upldr[Math.floor(Math.random() * jsonMeta.remoteSettings.upldr.length)];
  //       Session.set('upldr', rand)
  //     }
  //   }
  // });

  // load language
  loadDefaultLang(function() {
    loadLangAuto(function() {
      console.log('Loaded languages')
      // start router
      FlowRouter.initialize({hashbang: true}, function() {
        console.log('Router initialized')
      });
      // handle manual fragment change
      $(window).on('hashchange', function() {
        FlowRouter.go(window.location.hash)
      });
    })
  })


  // init steem connect
  var sc2 = sc2sdk.Initialize({
    app: 'dtube.app',
    callbackURL: 'https://d.tube/#!/sc2login',
    accessToken: 'access_token'
  });
  window.sc2 = sc2

  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  if (Session.get('remoteSettings').warning)
    toastr.warning(Session.get('remoteSettings').warning, translate('WARNING_TITLE'))

  steem.api.getDynamicGlobalProperties(function(err, result) {
    if (result)
    Session.set('steemGlobalProp', result)
  })

  Market.getSteemPrice()
  Market.getSteemDollarPrice()

  // Waka.connect({
	// 	"host": "steemwhales.com",
	// 	"port": 3456,
	// 	"path": "/peerjs",
	// 	"debug": false
	// })

  // native IPFS node
  // $.getScript('js/ipfs.js', function(){
  //   console.log('IPFS loaded')
  //   const repoPath = 'dtube-'+String(Math.random())
  //
  //   const node = new Ipfs({
  //     repo: repoPath,
  //     config: {
  //       Addresses: {
  //         Swarm: [
  //           '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
  //         ]
  //       },
  //       Bootstrap: [
  //         "/ip4/127.0.0.1/tcp/9999/ws/ipfs/QmYRokUHWByetfpdcaaVJLrJpPtYUjXX78Ce5SSWNmFfxg"
  //       ]
  //     },
  //     init: true,
  //     start: true,
  //     EXPERIMENTAL: {
  //       pubsub: false
  //     }
  //   })
  //
  //   // expose the node to the window, for the fun!
  //   window.ipfs = node
  //
  //   node.on('ready', () => {
  //     console.log('Your node is ready to use')
  //   })
  // });



  // Waka.api.Emitter.on('peerchange', listener = function(){
  //   Videos.refreshWaka()
  // })
  // Waka.api.Emitter.on('newshare', listener = function(article){
  //   Videos.refreshWaka()
  // })
})