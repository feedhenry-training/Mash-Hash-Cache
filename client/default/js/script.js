// Wait until the everythings loaded before setting up the app
$fh.ready(function () {
  var mashup_button = $('#mashup_button');
  
  mashup_button.bind('click', function (e) {
    mashup_button.attr('disabled', true).val('loading...');
    // Get our locally stored hash of the data if we have one
    $fh.data({
      act: 'load',
      key: 'mashup_hash'
    }, function (res) {
      // We have a hash, lets send this along to the server
      if (null !== res.val) {
        var hash = res.val;
        doMashup(hash);
      }
      else {
        // No hash, so we haven't gotten any data from server yet
        // Lets just call the server and get whatever data it has
        doMashup();
      }
    }, function (error) {
      alert(error);
      enableMashupButton();
    });
  });
});


function doMashup(hash) {
  hash = 'undefined' === typeof hash ? '' : hash;
  
  // Call the server side function to get the mashup data
  $fh.act({
    act: 'getMashup',
    req: {
      hash: hash,
      timestamp: new Date().getTime()
    }
  }, function (res) {
    var mashup = res;
    
    // Check if our hash's match, so we can use the locally cached data
    if (hash === mashup.hash) {
      // we already have the latest data, lets pull it from local storage
      $fh.data({
        act: 'load',
        key: hash
      }, function (res) {
        if (null !== res.val) {
          // Parse out the data and show it
          var data = JSON.parse(res.val);
          updateMashup(hash, data);
        }
        else {
          // Local data doesn't exist. Notify user and get fresh data instead
          alert('Server said hashes match, but no local data found for ' + hash
                + '. Doing a fresh mashup call to repopulate our local data. (no hash parm passed to ensure server call)');
          doMashup();
        }
      }, function (error) {
        alert('Error retrieving mashup data from local storage:' + error);
        enableMashupButton();
      });
    }
    else {
      // Hash's don't match, so server has included the newest data to use
      // Lets save it and update our hash value
      $fh.data({
        act: 'save',
        key: 'mashup_hash',
        val: mashup.hash
      }, function (res) {
        // hash saved - so now save the new mashup data returned
        $fh.data({
          act: 'save',
          key: mashup.hash,
          val: JSON.stringify(mashup)
        }, function (res) {
          // mashup data saved
        }, function (error) {
          alert(error);
          enableMashupButton();
        });
      }, function (error) {
        alert(error);
        enableMashupButton();
      });
      // No need to wait for asynchronous saving above to finish. Lets go ahead
      // and show the latest mashup data
      updateMashup(hash, mashup);
    }
  }, function (code,errorprops,params) {
    // Something went wrong with server side function call, let's alert the user
    alert('Failed to get mashup from server. Error:' + code);
    enableMashupButton();
  });
}
  

function updateMashup(hash, mashup) {  
  $('#mashup_myhash').text(hash);
  $('#mashup_serverhash').text(mashup.hash);
  $('#mashup_cached').text(hash === mashup.hash);
  $('#mashup_entries').text(mashup.data.length);
  $('#mashup_data').text(JSON.stringify(mashup.data));
  
  enableMashupButton();
}

function enableMashupButton() {
  $('#mashup_button').removeAttr('disabled').val('Get Mashup from Server');
}
