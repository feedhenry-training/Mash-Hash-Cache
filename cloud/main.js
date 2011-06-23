/**
 * Server-side function. It will be invoked once client use $fh.act to call this function.
 * It will return whether client cached data is up to date. If no, the current data and hash will be retrived as well.
 * @param hash client-side cached hash value which is parsed as parameter. Use $params.hash to retrive it.
 */
function getMashup() {

  var response = {};
  
  // Check the cloud cache to see if we have data
  var cached = readCache();

  // No cahced data in cloud
  if( ""=== cached ) {
    
    // Get data from remote web services
    var data = doMashUp();

    // Create MD5 hash of data
    var hash = createHash($fh.stringify(data));

    // Store data and hash in cloud cache
    doCache(hash, data);

    // Build response object
    response = {'data': data, 'hash':hash, 'cached':false};
  }
  else {
    //transform cached data from string type to object type
    cached=$fh.parse(cached);
    // Check if client hash value present & correct
    if( $params.hash && $params.hash === cached.hash ) {
      // Don't need to send data back to client as hash is up to date
      response = {'hash':$params.hash, 'cached':true};
    }
    else {
      // Hash value from client missing or incorrect, return cached cloud data
      response = cached;
    }
  }

  return response;
}
