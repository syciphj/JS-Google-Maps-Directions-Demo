import './style.css';

let map,
  directionsService,
  directionsDisplayArr = [],
  selectedTravelMode = 'DRIVING';

const resultsPanel = document.querySelector('.side-panel__results');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 49.59917, lng: 6.13301 },
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
}

window.initMap = initMap;

const travelOpts = document.querySelectorAll('.travel');
travelOpts.forEach((el) =>
  el.addEventListener('click', (e) => chooseTravel(e.currentTarget))
);

function chooseTravel(target) {
  const travelMode = target.getAttribute('travelMode');
  if (travelMode) selectedTravelMode = travelMode;
  document.querySelectorAll('.travel').forEach((el) => {
    if (el.getAttribute('travelMode') === travelMode) {
      if (el.classList.contains('selected')) return;

      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
}

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const start = formData.get('origin');
  const end = formData.get('destination');
  console.log('directions request submitted');
  clearPanel();
  calculateAndDisplayRoute(start, end);
});

function calculateAndDisplayRoute(start, end) {
  document.querySelector('.loading').classList.remove('hidden');
  directionsService
    .route({
      origin: start,
      destination: end,
      travelMode: selectedTravelMode,
      transitOptions:
        selectedTravelMode === 'DRIVING' ? null : { modes: ['TRAIN'] },
      provideRouteAlternatives: true,
    })
    .then((res) => {
      console.log(res);
      if (res.status && res.status === 'OK') {
        document.querySelector('.loading').classList.add('hidden');
        const routes = res.routes;
        routes.forEach((route, index) => {
          populatePanel(route, index);
          const display = new google.maps.DirectionsRenderer({ map: map });
          display.setDirections(res);
          display.setRouteIndex(index);
          display.setOptions({
            polylineOptions: {
              strokeColor: index === 0 ? '#4169E1' : '#F44336',
              strokeWeight: 5 - index,
              zIndex: 5 - index,
            },
          });
          directionsDisplayArr.push(display);
        });

        resultsPanel.classList.remove('hidden');
      }
    })
    .catch((err) => console.error('Unable to get directions', err));
}

function populatePanel(route, index) {
  /**
   * Basically create this:
   * <div class="card">
   *   <div class="driving-img darken ml-1"></div>
   *   <h2>Route Name</h2>
   *   <div class="route-metrics">
   *     <span class="route-metrics__time">20 mins</span>
   *     <span class="route-metrics__distance">2.4km </span>
   *   </div>
   * </div>
   */
  const test = 'test';
  let card = `
    <div class="card">
      <div class="${selectedTravelMode.toLowerCase()}-img darken ml-1"></div>
      <h2 class="${index === 0 ? 'blue' : 'red'}"> ${
    route.summary !== '' ? route.summary : route.legs[0].departure_time.text
  } </h2>
      <div class="route-metrics">
        <span class="route-metrics__time">${route.legs[0].duration.text}</span>
        <span class="route-metrics__distance">${
          route.legs[0].distance.text
        }</span>
      </div>
  `;
  resultsPanel.innerHTML += card;
}

function clearPanel() {
  directionsDisplayArr.forEach((d) => d.setMap(null));
  directionsDisplayArr = [];
  resultsPanel.innerHTML = `<h1>Available Routes</h1>`;
}
