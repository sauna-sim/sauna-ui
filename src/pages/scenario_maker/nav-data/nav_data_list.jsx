import React, { useState } from "react";
import { Button } from "react-bootstrap";
import AirportModal from "./airport_modal";

export default function NavDataList() {
    const [airports, setAirports] = useState([]);

    const [showAirportModal, setShowAirportModal] = React.useState(false);
    const [currentAirport, setCurrentAirport] = React.useState(null);

    const onAirportSubmit = (airport) => {
        if(currentAirport) {
            const updatedAirports = airports.map((a) =>
                a.airportIdent === currentAirport.airportIdent ? airport : a
            );

            setAirports(updatedAirports);
        } else {
            setAirports([...airports, airport]);
        }
        setCurrentAirport(null);
    };

    return(
        <div>
            <Button
                variant="secondary"
                onClick={() => {
                    setCurrentAirport(null);
                    setShowAirportModal(true);
                }}
            >
                Add Airport
            </Button>
            {showAirportModal && (
                <AirportModal
                    onClose={() => setShowAirportModal(false)}
                    onAirportSubmit={onAirportSubmit}
                    airport={currentAirport}
                    airports={airports}
                />
            )}
        </div>
    );
}