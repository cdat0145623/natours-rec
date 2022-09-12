/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2luYml1dCIsImEiOiJjbDZ3MWRyMW4wYzM3M2RtZTAxZ2FmajBoIn0.cpQ7wY-QQ1ii1jSbtbSr3g';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kinbiut/cl6x10ry4000l15pmhtk7gbkb',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 4,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
