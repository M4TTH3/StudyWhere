import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore 
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

function Map () {
   
    mapboxgl.accessToken = 'pk.eyJ1IjoibTR0dGgiLCJhIjoiY2xpbWNlbWtpMHZrMTNybGd4bWhlc2FrdSJ9.whpIP188eyw34_tScd7oEQ';

    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [lng, setLng] = useState(-80.5440);
    const [lat, setLat] = useState(43.4712);
    const [zoom, setZoom] = useState(15.2);

    useEffect(() => {
        const initializeMap = () => {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [lng, lat],
                zoom: zoom,
            });

            map.addControl(new mapboxgl.NavigationControl(), 'top-right')

            map.on("load", () => {
                setMap(map);
                map.resize();
            });

        }

        if (!map) initializeMap();
    })

    return (
        <>
            <div ref={el => (mapContainer.current = el)} id='map-container'/>
        </>
    )
}

export default Map;