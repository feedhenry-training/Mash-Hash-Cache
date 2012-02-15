var CACHE_TIME = 10, // seconds to cache data
    FLICKR_API_KEY = 'd8dcf43b857cf7eb68030127f443715a',
    FLICKR_LIMIT = 5,
    YAHOO_QUERY = 'pizza',
    YAHOO_LIMIT = 5;

function doMashUp() {
  var mashup = [];
  
  // Add some test placemarks so cache can be invalidated if required
  //mashup.push({type: 'test', title: 'Test 1', lat: 57.5, lon: -7.5});
  //mashup.push({type: 'test', title: 'Test 2', lat: 57, lon: -7});
  //mashup.push({type: 'test', title: 'Test 3', lat: 57.3, lon: -7.3});
  
  // Get placemarks from flickr  
  var flickr = getFlickrData();
  // Iterate over the results, adding them to the mashup
  for (var fi = 0, fl = flickr.length; fi < fl; fi++) {
    var entry = flickr[fi];
    mashup.push({
      type: 'flickr',
      title: entry.title,
      lat: entry.latitude,
      lon: entry.longitude
    });
  }
  // Get placemarks from Yahoo Local Search
  var yahoo = getYahooData();
  // Iterate over the results, adding them to the mashup
  for (var yi = 0, yl = yahoo.length; yi < yl; yi++) {
    var entry = yahoo[yi];
    mashup.push({
      type: 'yahoo',
      title: entry.Title,
      lat: entry.Latitude,
      lon: entry.Longitude
    });
  }
  
  return mashup;
}

function createHash(str) {
  // var hash = $fh.hash({'algorithm':'MD5', 'text':str});
  // return hash.hashvalue;
  var hash = MD5(str);
  return hash;
}

function readCache() {
  var ret = $fh.cache({
    "act": "load",
    "key": "_cache"
  });
  return ret.val;
}

function doCache(hash, data) {
  var obj = {
    "hash": hash,
    "data": data,
    "cached": true
  };
  $fh.cache({
    "act": "save",
    "key": "_cache",
    "val": obj,
    "expire": CACHE_TIME
  });
}

function getFlickrData() {
  var response = [];
  var param = {
    url: "http://www.flickr.com/services/rest/",
    method: "POST",
    charset: "UTF-8",
    contentType: "application/x-www-form-urlencoded",
    body: "method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&sort=interestingness-desc&place_id=2367105&extras=geo%2Cmedia&per_page=" + FLICKR_LIMIT + "&format=json&nojsoncallback=1"
  }
  var res = $fh.web(param);
  //$fh.log('debug', res);
  var data = $fh.parse(res.body);
  if (data.stat == 'ok') {
    response = data.photos.photo
  }
  return response;
}

function getYahooData() {
  var response = [];
  var param = {
    url: "http://local.yahooapis.com/LocalSearchService/V3/localSearch",
    method: "POST",
    charset: "UTF-8",
    contentType: "application/x-www-form-urlencoded",
    body: "appid=YahooDemo&query=" + YAHOO_QUERY + "&location=boston,ma,USA&results=" + YAHOO_LIMIT + "&output=json"
  }
  var res = $fh.web(param);
  var data = $fh.parse(res.body);
  response = data.ResultSet.Result;
  return response;
}
