function getWindowContent(place) {
  var infoContent = "";
  infoContent+='<div class="info-window">';
  infoContent+='<div class="heading-div">';
  infoContent+='<div class="heading-table">';
  infoContent+='<div class="info-window-name">';
  infoContent+='<h2>' + place.name + '</h2>';
  infoContent+='</div>';
  infoContent+='<div class="heading-value">';
  if(place.rating) {
    infoContent+='<div class="star-image">';
    infoContent+='<div>' + place.rating + '</div>';
    infoContent+='</div>';
  }
  infoContent+='</div>';
  infoContent+='</div>';
  infoContent+='</div>';
  infoContent+='<div class="details-div">';
  if(place.opening_hours) {
    if(place.opening_hours.open_now) {
      infoContent+='<div class="open-now">';
      infoContent+='<span class="green">Open Now</span>';
      infoContent+='</div>';
    }
    else {
      infoContent+='<div class="open-now">';
      infoContent+='<span class="red">Closed Now</span>';
      infoContent+='</div>';
    }
  }
  if(place.permanently_closed) {
    infoContent+='<div class="permanently-closed">';
    infoContent+='<span class="red">Permanently closed</span>';
    infoContent+='</div>';
  }
  infoContent+='<div class="details-table">';
  if(place.formatted_address) {
    infoContent+='<div class="details-row">';
    infoContent+='<div class="key-name">Address</div>';
    infoContent+='<div class="key-value">';
    infoContent+='<span>' + place.formatted_address + '</span>';
    infoContent+='</div>';
    infoContent+='</div>';
  }
  if(place.international_phone_number) {
    infoContent+='<div class="details-row" ng-if="currentPlace.international_phone_number">';
    infoContent+='<div class="key-name">Phone</div>';
    infoContent+='<div class="key-value">';
    infoContent+='<span>' + place.international_phone_number + '</span>';
    infoContent+='</div>';
    infoContent+='</div>';
  }
  if(place.opening_hours && place.opening_hours.weekday_text) {
    infoContent+='<div class="details-row">';
    infoContent+='<div class="key-name">Schedule</div>';
    infoContent+='<div class="key-value">';
    infoContent+='<div class="schedule-table">';
    for(var i=0;i<place.opening_hours.weekday_text.length;i++){
      var text = place.opening_hours.weekday_text[i];
      var weekdayDetails = divideWeekdayScheduleText(text);

      infoContent+='<div class="schedule-row">';
      infoContent+='<div class="schedule-key-name">' + weekdayDetails.day + '</div>';
      infoContent+='<div class="schedule-value-name">';
      infoContent+='<span>' + weekdayDetails.sched + '</span>';
      infoContent+='</div>';
      infoContent+='</div>';
    }
  }
      infoContent+='</div>';
      infoContent+='</div>';
      infoContent+='</div>';
  if(place.url) {

    infoContent+='<div class="maps-div">';
    infoContent+='<a href="' + place.url + '" target="_blank">';
    infoContent+='<span class="map-link">Map Link</span>';
    infoContent+='</a>';
    infoContent+='</div>';
  }
  if(place.website) {
    infoContent+='<div class="website-div">';
    infoContent+='<a href="' + place.website + '" target="_blank">';
    infoContent+='<span class="website-link">Website</span>';
    infoContent+='</a>';
    infoContent+='</div>';
  }
  infoContent+='</div>';
  infoContent+='</div>';
  infoContent+='</div>';
  return infoContent;
}
