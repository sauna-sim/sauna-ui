import React, {useState} from "react";
import {useSelector} from "react-redux";
import {sendTextCommand} from "../../actions/command_actions.js";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";

export const CommandWindow = ({}) => {
    const messages = useSelector((state) => state.messages);
    const aircraftList = useSelector(state => state.aircraftList);
    const [selectedCallsign, setSelectedCallsign] = useState("");
    const [commandText, setCommandText] = useState("");

    const messageItems = messages.map((msg, i) =>
        <div
            key={i}
            style={{alignSelf: msg.received ? "start" : "end"}}
            //className={msg.received ? "border border-secondary" : "border border-primary"}
        >{msg.msg}</div>
    );

    const callsignItems = aircraftList.map((callsign) =>
        <option key={callsign} value={callsign}>{callsign}</option>
    );
    callsignItems.push(<option key={""} value={""}>None...</option>);

    const onCommandKeyPress = (e) => {
        if (e.key === "Enter") {
            if (commandText) {
                void sendTextCommand(selectedCallsign, commandText);
                setCommandText("");
            }
            e.preventDefault();
        } else if (e.key === "Escape") {
            setSelectedCallsign("");
            e.preventDefault();
        } else if (e.key === "Tab") {
            if (commandText) {
                const foundCallsign = aircraftList.find((cs) => new RegExp(commandText, 'i').test(cs));

                if (foundCallsign) {
                    setSelectedCallsign(foundCallsign);
                    setCommandText("");
                }
            }

            e.preventDefault();
        }
    }

    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw"
            }} className={"p-1"}>
                <div style={{
                    flexGrow: "1",
                    overflowY: "scroll",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "end"
                }} className={"mb-2"}>
                    {messageItems}
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <Dropdown
                        value={selectedCallsign ?? ""}
                        className={"mr-1"}
                        onChange={(e) => setSelectedCallsign(e.value)}
                        options={aircraftList} />
                    <InputText
                        className={"w-full flex-grow-1"}
                        autoFocus={true}
                        placeholder={"Enter Command"}
                        autoCorrect="off"
                        autoComplete="off"
                        autoCapitalize="off"
                        onKeyDown={onCommandKeyPress}
                        value={commandText}
                        onChange={(e) => setCommandText(e.target.value)}
                    />
                </div>
            </div>
        </>
    )
};