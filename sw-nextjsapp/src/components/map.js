import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOMServer from 'react-dom/server'

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore 
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

export const maptoken = 'pk.eyJ1IjoibTR0dGgiLCJhIjoiY2xpbWNlbWtpMHZrMTNybGd4bWhlc2FrdSJ9.whpIP188eyw34_tScd7oEQ';

function Map ({ allFriendLists, demoSessions }) {
   
    mapboxgl.accessToken = maptoken;

    const mapContainer = useRef(null);
    const [map, setMap] = useState(null);
    const [lng, setLng] = useState(-80.5440);
    const [lat, setLat] = useState(43.4712);
    const [zoom, setZoom] = useState(15.2);

    const [ markers, setMarkers ] = useState([])

    useEffect(() => {
        // Initialize the map
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
    }, [map]);

    useEffect(() => {
        // Setup markers for the map from friend sessions

        if (map) {
            const sessions = allFriendLists?.sessions ? {...allFriendLists.sessions, ...demoSessions}: demoSessions;

            for (const key in sessions) {
                const session = sessions[key];

                // Create element for Marker css
                const el = document.createElement('div');
                el.className = 'marker';

                const times = session.times;

                const clockTime = {s: 0, m: 0, h: 0};

                const formatTime = (difference) => {
                    //Arrange the difference of date in days, hours, minutes, and seconds format
                    clockTime.s = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    clockTime.m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    clockTime.h = Math.floor((difference % (1000 * 60)) / 1000);
                }

                formatTime(times);

                // Get the active duration
                let activeDuration = times.length % 2 === 1 ? Date.now() : 0;
                times.forEach((epoch, index) => {
                    activeDuration += (index % 2 === 1) ? epoch : epoch * -1;
                });

                const isRunning = times.length % 2 === 1 ? true: false;

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([session.longitude, session.latitude])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 })
                            .setHTML(
                                `
                                <h1 class="mapboxgl-popup-title">${session.title !== '' ? session.title: "Currently Studying"}</h1>
                                <p>Location: ${session.buildingName} - ${session.roomName}</p>
                                <p>Tasks: ${session.tasks.join(' ')}</p>
                                <p>Duration: ${clockTime.h}hr ${clockTime.m}min</p> 
                                <p>Status: ${isRunning ? "Active": "Paused"}</p>
                                `
                            )
                    )
                    .addTo(map);

                setMarkers((state) => [...state, marker]);
            }
        }
    }, [map, allFriendLists, setMarkers]);

    return (
        <>
            <div ref={el => (mapContainer.current = el)} id='map-container'/>
        </>
    )
}

export default Map;