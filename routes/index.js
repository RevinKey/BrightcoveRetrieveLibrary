var express = require('express');
var router = express.Router();
const Bluebird = require('bluebird');
const request = require('../helpers/request.js');
const requestP = require('../helpers/requestPromise.js');

const _ = require('underscore');
/* GET home page. */

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Async/await test',
    myPartial: () => 'welcome'
  });
});
// handle post
router.post('/', async (req, res, next) => {
  try {
    // await to get access token
    const authString = Buffer.from(`${req.body.clientID}:${req.body.clientSecret}`).toString('base64');
    const getAccessToken = await request({
      method: 'POST',
      url: 'https://oauth.brightcove.com/v3/access_token?grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    // with token await to get number of videos
    const getCount = await request({
      method: 'GET',
      url: `https://cms.api.brightcove.com/v1/accounts/${req.body.pubID}/counts/videos`,
      headers: {
        Authorization: `Bearer ${getAccessToken.body.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    //determine number of calls needed
    let videos = [];
    const max = Math.ceil(getCount.body.count / 100);
    // try to make calls while handling concurrency and return the resulted video objects
    try {
      results = await Bluebird.map(
        _.range(0, max),
        async i => {
          try {
            // here is your promise chain
            return await request({
              method: 'Get',
              url: `https://cms.api.brightcove.com/v1/accounts/${req.body.pubID}/videos?limit=100&offset=${i * 100}`,
              headers: {
                Authorization: `Bearer ${getAccessToken.body.access_token}`,
                'Content-Type': 'application/json'
              }
            }).then(response => {
              return response.body;
            })
          } catch (err) {
            console.log(err);
          }
        },
        { concurrency: 90 }
      );
      for (var i = 0; i < max; i++) {
        for (var j = 0; j < results[i].length; j++) {
          videos.push(results[i][j].id);
        }
      }
      console.log(videos.length);
        res.render('index', {
          title: 'Async/await test',
          videos: videos,
          myPartial: () => 'videos'
        });
    } catch (err) {
      console.log(err);
    }
  } catch (e) {
    console.log(e);
  }

});
module.exports = router;
