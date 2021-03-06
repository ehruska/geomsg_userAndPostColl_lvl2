

(function(){




    var readyStatus = false,
        firstRound = true,
        exploreMode = false,
        markerSet = [],
        explorePos,
        lastPos;

    var showField,
        fieldRadius;

    document.onkeydown = function(e){
      if(e.keyCode ===  13){      
        window.location.href = "#!";
      }

    }

    document.getElementById("send-status").onclick = function(){
      //make sure map exists before start to toggling
      if(map){
        console.log('hi')
      if(!readyStatus){
        this.style.background = "white";

        this.value = "message on";
        readyStatus = true;
      }else{
        this.style.background = "darkgrey";

        this.value = "message off";
        readyStatus = false;
      }

    }

    }

    // Switch between img upload mechanism and adding a url image 
    // ext link when filling out the form when creating a message
    document.getElementById("imgMethodTog").onclick = function(){
        if(document.querySelector("[name=imgurl]").className === "hidden"){
            document.querySelector("[name=imgurl]").className = "";
            document.querySelector("[name=uploadedimg]").className = "hidden";

            document.querySelector("[name=uploadedimg]").value = "";

            this.parentNode.removeChild(document.querySelector("#addMsgForm img"));
            this.parentNode.removeChild(document.querySelector("[name=imgdescrip]"));
        }else {
            document.querySelector("[name=imgurl]").className = "hidden";
            document.querySelector("[name=uploadedimg]").className = "";

            document.querySelector("[name=imgurl]").value = "";

            this.parentNode.removeChild(document.querySelector("#addMsgForm img"));
            this.parentNode.removeChild(document.querySelector("[name=imgdescrip]"));
        }
    }

    document.querySelector("[name=uploadedimg]").onchange = function(){
      
      if(this.value !== ""){
        var self = this;

        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    // create image element to sample chosen file input
                    var msgImgSample = document.createElement("img");
                    msgImgSample.src = e.target.result;
                    msgImgSample.style.width = "200px";

                    // create txt input elem to add a descri[tion for img
                    var msgImgDescrip = document.createElement("input");

                    msgImgDescrip.type = "text";
                    msgImgDescrip.placeholder = "add image description";
                    msgImgDescrip.name = "imgdescrip";
                    msgImgDescrip.required = "required";

                    self.parentNode.insertBefore(msgImgDescrip, document.querySelector("[type=submit]"))
                    self.parentNode.insertBefore(msgImgSample, document.querySelector("#addMsgForm label"))

                }

                reader.readAsDataURL(input.files[0]);
            }
        }

        readURL(this);

        
      }
    }

    document.querySelector("[name=imgurl]").onchange = function(){
        if(!document.querySelector("[name=imgdescrip]")){
          var msgImgDescrip = document.createElement("input");

          msgImgDescrip.type = "text";
          msgImgDescrip.placeholder = "add image description";
          msgImgDescrip.name = "imgdescrip";
          msgImgDescrip.required = "required";

          this.parentNode.insertBefore(msgImgDescrip, document.querySelector("[type=submit]"))
        }
    };

    document.querySelector("[name=imgurl]").onblur = function(){
      if(this.value !== ""){
        var msgImgSample = document.createElement("img");

        msgImgSample.src = this.value;
        msgImgSample.style.width = "200px";

        this.parentNode.insertBefore(msgImgSample, document.querySelector("#addMsgForm label"))
      }
    };


    document.getElementById("show-limit").onclick = function(){
      //make sure map exists before start to toggling
      if(map){

      if(!showField){
          if(!fieldRadius){
              fieldRadius = new google.maps.Circle({
                                    strokeColor: "yellow",
                                    strokeOpacity: 0.1,
                                    strokeWeight: 6,
                                    fillColor: "yellow",
                                    map: map,
                                    center: lastPos,
                                    radius: 200
                                  });
          } else {
              fieldRadius.setMap(map);
              fieldRadius.setCenter(lastPos);
          }

        showField = true;
      }else{
        fieldRadius.setMap(null);

        showField = false;
      }

    }

    }


    document.getElementById("explore").onclick = function(){
      togExploreMode();
    }



    function togExploreMode (postResults){
      var exploreTog = document.getElementById("explore");
      
      //make sure map exists before start to toggling
      if(map){

      if(!exploreMode){


            var closePosts= [];

            if(postResults){
                closePosts = postResults;
            }else{

                $.get('/explore', function (data) {
                  closePosts = data;
                })
            }

              for (var i = 0; i < closePosts.length; i++) {


                  var marker = new google.maps.Marker({
                    position: {lat: closePosts[i].location.coordinates[0], lng: closePosts[i].location.coordinates[1]},
                    map: map
                  });

                  var circle = new google.maps.Circle({
                      center: {lat: closePosts[i].location.coordinates[0], lng: closePosts[i].location.coordinates[1]},
                      strokeColor: "yellow",
                      strokeOpacity: 0.1,
                      strokeWeight: 6,
                      fillColor: "yellow",
                      radius: 100,
                      map: map
                    });


                  attachMsg(marker, "Here is my Message");
                 
                  markerSet.push({marker: marker, circle: circle });

              }


            exploreTog.style.background = "white";
            exploreTog.value = "discover on";

            // convert obj to string, if kept as object explorePos will always reference lastPos and
            // it would be pointless to compare the two because they would always have the same ref 
            // to the same object
            explorePosString = (lastPos.lat +","+lastPos.lng).split(",");
            explorePos = {lat: parseInt(explorePosString[0]), lng: parseInt(explorePosString[1])};
            exploreMode = true;

      }else{
            // loop through existing markers and set their map to null. We are going to do another look
            // up of messages when the user clicks explore mode at a later time using their new location
            for(var i = 0; i < markerSet.length; i++){
              markerSet[i].marker.setMap(null);
              markerSet[i].circle.setMap(null);

              markerSet[i].marker = null;
              markerSet[i].circle = null;
            }

            markerSet = [];
            // get rid of messages here, because when true the if statement above is met it will
            // fetch brand new data because prev location can be much different than current location
            exploreTog.style.background = "darkgrey";
            exploreTog.value = "discover off";

            explorePos = null;
            exploreMode = false;
      }

    }

    }




    var attachMsg = function (marker, note) {
       var infowindow = new google.maps.InfoWindow({
            content: note
       });

       marker.addListener('click', function() {
           infowindow.open(marker.get('map'), marker);
       });
    }


    // handle msg form submission with javascript if enabled otherwise
    // attach coords to hidden field on form to be submitted the old fashion way
    // document.getElementById("addMsgForm").onsubmit = function(e) {
    //    e.preventDefault();

    //    var inputs = $(".msgFields");

    //    $.post('/setmsg', {
    //       latcoord: $('#coordLatField').val(),
    //       lngcoord: $('#coordLngField').val(),
    //       url: inputs[0].value,
    //       image: inputs[1].files[0],
    //       content: inputs[2].value,
    //     }, function(data){
    //       var marker = new google.maps.Marker({
    //                 position: {lat: data.location.coordinates[0], lng: data.location.coordinates[1]},
    //                 map: map
    //               });

    //        attachMsg(marker, data.contents.text+"<img src='"+data.contents.imageUrl+"' width='50px'/><br/>"+data.datetime);
    //    })

    // }

    document.getElementById("close").onclick = function() {

      $('#addMsgForm input[type=text]').val('')

    }


    // function trigAlg(clickedPos){
    //   return Math.sqrt(Math.pow((clickedPos["lat"]() - lastPos.lat), 2) + Math.pow((clickedPos["lng"]() - lastPos.lng), 2));
    // }



    function initialize() {


          function getLocation() {
              if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(showPosition);
              }
          } 

          function showPosition(position) {
              lastPos = { lat:position.coords.latitude, lng:position.coords.longitude};
              // Map options here
              var mapOptions = {
                center: lastPos,
                zoom: 16,
                disableDefaultUI:true
              };

              ///////////////////////////////
              // explore mode starts as on //
              ///////////////////////////////
              if(firstRound){
                // Create a new map that gets injected into #map in our HTML
                map = new google.maps.Map(document.getElementById('map'), mapOptions);
                map.set("styles",[{featureType:"all",elementType:"labels.text.fill",stylers:[{color:"#ffffff"}]},{featureType:"all",elementType:"labels.text.stroke",stylers:[{color:"#000000"},{lightness:13}]},{featureType:"administrative",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#144b53"},{lightness:14},{weight:1.4}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#08304b"}]},{featureType:"poi",elementType:"geometry",stylers:[{color:"#0c4152"},{lightness:5}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#0b434f"},{lightness:25}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.arterial",elementType:"geometry.stroke",stylers:[{color:"#0b3d51"},{lightness:16}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#000000"}]},{featureType:"transit",elementType:"all",stylers:[{color:"#146474"}]},{featureType:"water",elementType:"all",stylers:[{color:"#021019"}]}]);
                // var circle = new google.maps.Circle({
                //   center: {lat: position.coords.latitude, lng: position.coords.longitude},
                //   strokeColor: "yellow",
                //   strokeOpacity: 0.1,
                //   strokeWeight: 6,
                //   fillColor: "yellow",
                //   radius: 500,
                //   map: map
                // });
                google.maps.event.addListener(map, 'click', function(event) {
                  if(readyStatus){
                    var clickedPos = event.latLng;

                    // if(trigAlg(clickedPos) > 0.005){
                    //   // alert('within dist');
                    //   return false;
                    // }


                    window.location.href = "#modalOverlay";

                    // set the hidden coord field equal to the corresponding lat lng coords that were clicked
                    // this will allow us to post the old fashion way in case JavaScript is disabled.
                    document.getElementById("coordLatField").value = clickedPos["lat"]();
                    document.getElementById("coordLngField").value = clickedPos["lng"]();
                  }
                });

                

                $.post('/locate', lastPos, function(){
                    $.get('/msgs', function(messages){
                      for (var i = 0; i < messages.length; i++) {
                        var marker = new google.maps.Marker({
                          position: {lat: messages[i].location.coordinates[0], lng: messages[i].location.coordinates[1]},
                          map: map
                        });

                        attachMsg(marker, messages[i].contents.text+"<img src='"+messages[i].contents.imgFile+"' width='250px' alt='"+messages[i].contents.imgFileDescrip+"'/><br/>"+messages[i].datetime);
                      }

                  });
                });
                


                firstRound = false;
              } else {
                map.setOptions(mapOptions);

                $.post('/locate', lastPos);

                  // The existence of explorePos means explore mode is turned on (Essentially msg posts 
                  // are on the map)
                  if(explorePos && (explorePos.lat < lastPos.lat - 0.5 || explorePos.lat > lastPos.lat + 
                    0.5 || explorePos.lng < lastPos.lng - 0.5 || explorePos.lng > lastPos.lng + 0.5 )){
                    // Option 1:
                    // Recommend the user update and reexplore posts with alert dialog box
                    // alert("Refresh and get closer posts according to new location by turned explore
                    // mode off then on again")

                    // Option 2:
                    // Toggle explore mode automatically. Since we know if we are getting in this if 
                    // then explore mode is true ("on") so call togExploreMode twice to toggle off 
                    // then on again.
                    togExploreMode();
                    togExploreMode();
                  }

                  // Update the center of the radius field if showing on map (locate) refresh interval
                  if(showField){
                    fieldRadius.setCenter(lastPos)
                  }

                
              }

              ////////////////////////////////
              // explore mode starts as off //
              ////////////////////////////////
              // $.post('/locate', lastPos);
              //
              // if(firstRound){
              //   // Create a new map that gets injected into #map in our HTML
              //   map = new google.maps.Map(document.getElementById('map'), mapOptions);
              //   map.set("styles",[{featureType:"all",elementType:"labels.text.fill",stylers:[{color:"#ffffff"}]},{featureType:"all",elementType:"labels.text.stroke",stylers:[{color:"#000000"},{lightness:13}]},{featureType:"administrative",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#144b53"},{lightness:14},{weight:1.4}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#08304b"}]},{featureType:"poi",elementType:"geometry",stylers:[{color:"#0c4152"},{lightness:5}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#0b434f"},{lightness:25}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.arterial",elementType:"geometry.stroke",stylers:[{color:"#0b3d51"},{lightness:16}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#000000"}]},{featureType:"transit",elementType:"all",stylers:[{color:"#146474"}]},{featureType:"water",elementType:"all",stylers:[{color:"#021019"}]}]);
              //   google.maps.event.addListener(map, 'click', function(event) {
              //     if(readyStatus){
              //       clickedPos = event.latLng;
              //       console.log(clickedPos);

              //       window.location.href = "#modalOverlay";

              //       // set the hidden coord field equal to the corresponding lat lng coords that were clicked
              //       // this will allow us to post the old fashion way in case JavaScript is disabled.
              //       // document.getElementById("coordField").value = clickedPos.lat+","+clickedPos.lng;
              //     }
              //   });

              //   firstRound = false;
              // } else {
              //   map.setOptions(mapOptions);
              // }

          }

        getLocation();
        
    }


    google.maps.event.addDomListener(window, 'load', initialize);
    // window.setInterval(initialize, 20000);

}());

