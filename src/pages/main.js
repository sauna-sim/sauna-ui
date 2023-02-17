import React, {Component} from "react";

class MainApp extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <>
                <h1>Hello World</h1>
                <button
                    onClick={_ =>
                        electron
                            .notificationApi
                            .sendNotification('Hi there!')}>Notify</button>
            </>
        );
    }
}

export default MainApp;