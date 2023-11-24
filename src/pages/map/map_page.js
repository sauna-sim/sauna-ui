import React, {Component, Fragment, useMemo} from "react";
import {closeMapWindow} from "../../actions/electron_actions";
import {MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip} from "react-leaflet";
import {Container} from "react-bootstrap";
import leafletMarkerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import leafletMarkerIconPng from "leaflet/dist/images/marker-icon.png";
import leafletMarkerShadowPng from "leaflet/dist/images/marker-shadow.png";
import planeMarkerIconPng from "../../assets/images/TargetMarker.png";
import L from 'leaflet';
import {getAircraftList} from "../../actions/aircraft_actions";
import {wait} from "../../actions/utilities";
import {RotatedMarker} from "./rotated_marker";
import {LeafletSemicircle} from "./leaflet_semicircle";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: leafletMarkerIcon2xPng,
    iconUrl: leafletMarkerIconPng,
    shadowUrl: leafletMarkerShadowPng
});

const planeIcon = new L.Icon({
    iconUrl: planeMarkerIconPng,
    iconSize: [10, 70],
    iconAnchor: [5, 35],
    popupAnchor: [0, 0]
});

export class MapPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            aircraftList: [],
            pollForAircraft: true,
            center: {
                lat: 0,
                lon: 0
            }
        }
    }

    async componentDidMount() {
        document.title = "SaunaSim Map";
        this.setState({
            pollForAircraft: true
        });
        this.pollForAircraft();
    }

    close = async () => {
        this.setState({
            pollForAircraft: false
        });

        // Close Electron Window
        await closeMapWindow();
    }

    pollForAircraft = async () => {
        while (this.state.pollForAircraft) {
            try {
                const aircraftList = await getAircraftList(true);

                if (this.state.center.lat === 0 && this.state.center.lon === 0 && aircraftList.length > 0) {
                    this.setState({
                        center: {
                            lat: aircraftList[0].position.latitude,
                            lon: aircraftList[0].position.longitude
                        }
                    });
                }

                this.setState({
                    aircraftList: aircraftList,
                });
            } catch (e) {
                console.log(e);
            }
            await wait(1000);
        }
    }

    getAircraftMarkers = () => {
        const {aircraftList, center} = this.state;

        console.log(center);

        console.log(aircraftList);

        return aircraftList.map((aircraft) => {
            const routePolyline = [];
            const routeCircles = [];
            if (aircraft.fms){
                let i = 0;
                for (const line of aircraft.fms.fmsLines){
                    if (line.center){
                        let startAngle = line.clockwise ? line.startTrueBearing : line.endTrueBearing;
                        let endAngle = line.clockwise ? line.endTrueBearing : line.startTrueBearing;

                        if (endAngle < startAngle){
                            endAngle += 360;
                        }
                        routeCircles.push(
                            <LeafletSemicircle
                                key={i}
                                color={"red"}
                                fill={false}
                                position={[line.center.lat, line.center.lon]}
                                radius={line.radius_m}
                                startAngle={startAngle}
                                stopAngle={endAngle}
                            />
                        );
                        i++;
                    } else {
                        routePolyline.push([
                            [line.startPoint.lat, line.startPoint.lon],
                            [line.endPoint.lat, line.endPoint.lon]
                        ]);
                    }
                }
            }

            return (
                <Fragment key={aircraft.callsign}>
                    <RotatedMarker
                        position={[aircraft.position.latitude, aircraft.position.longitude]}
                        rotationAngle={aircraft.position.track_True}
                        rotationOrigin="center"
                        icon={planeIcon}
                    >
                        <Tooltip direction="top" opacity={1} permanent>
                            {aircraft.callsign}
                        </Tooltip>
                    </RotatedMarker>

                    <Polyline pathOptions={{color: "red"}} positions={routePolyline}/>
                    {routeCircles}
                </Fragment>
            )
        });
    }

    render() {
        const {center} = this.state;
        return (
            <>
                {center.lat !== 0 && center.lon !== 0 &&
                <MapContainer center={[center.lat, center.lon]} zoom={8} scrollWheelZoom={true}
                              className="vh-100">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                    />
                    {this.getAircraftMarkers()}
                    <Marker position={[51.505, -0.09]}>
                        <Popup>
                            A pretty CSS3 popup. <br/> Easily customizable.
                        </Popup>
                    </Marker>
                </MapContainer>
                }
            </>
        )
    }
}