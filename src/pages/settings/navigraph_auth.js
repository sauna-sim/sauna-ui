import React, {Component} from "react";
import {Button} from "react-bootstrap";
import {getNavigraphPackages, navigraphAuthFlow} from "../../actions/navigraph_actions";
import {isNavigraphAuthenticated} from "../../actions/local_store_actions";

export class NavigraphAuthButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false
        }
    }

    attemptAuth = async () => {
        if (!isNavigraphAuthenticated()) {
            // Perform navigraph auth
            await navigraphAuthFlow((deviceAuthResp) => {
                // Get verification urls to display
                console.log(deviceAuthResp);

                this.open();
            });
        }

        await getNavigraphPackages();
    }

    open = () => {
        this.setState({showModal: true});
    }

    close = () => {
        this.setState({showModal: false});
    }

    render(){
        return (
            <>
                <Button variant={"secondary"} onClick={this.attemptAuth}>Auth Navigraph</Button>
            </>
        )
    }
}