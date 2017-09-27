import React, { Component } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { database, auth as googleAuth } from "../../../server/firebase_config";

import PollSelector from "./PollSelector";

class App extends Component {
  constructor(props) {
    super(props);

    this.googleAuthUrl =
      "https://us-central1-yaynaynay-ext.cloudfunctions.net/twitchToFirebaseAuth";

    this.paths = {
      pollsListener: null,
      activePollListener: null
    };

    this.state = {
      jwt: "",
      role: "",
      userId: "",
      googleJwt: "",
      polls: {},
      selectedPoll: "select",
      selectedPollTitle: "",
      activePoll: false,
      statusMsg: ""
    };
  }

  componentDidMount() {
    if (window.Twitch.ext) {
      window.Twitch.ext.onAuthorized(auth => {
        const jwt = auth.token;
        const jwtDecoded = jwtDecode(auth.token);
        const role = jwtDecoded.role;
        const userId = jwtDecoded.user_id;

        this.setState({
          jwt,
          role,
          userId
        });

        this.authWithGoogle(jwt);
      });
    }
  }

  componentWillUnmount() {
    if (this.paths.pollsListener) {
      database.ref(this.paths.pollsListener).off();
    }
    if (this.paths.activePollListener) {
      database.ref(this.paths.activePollListener).off();
    }
  }

  authWithGoogle = jwt => {
    axios
      .get(this.googleAuthUrl, {
        headers: {
          Authorization: jwt
        }
      })
      .then(res => {
        this.setState({ googleJwt: res.data });
        return googleAuth.signInWithCustomToken(res.data);
      })
      .then(() => {
        this.pollsListener();
        this.activePollListener();
      })
      .catch(() => {
        // throw new Error("Error in auth or database flow.")
      });
  };

  pollsListener = () => {
    if (this.paths.pollsListener) {
      database.ref(this.paths.pollsListener).off();
    }

    this.paths.pollsListener = `/polls/${this.state.userId}`;
    database.ref(this.paths.pollsListener).on("value", snapshot => {
      this.setState({ polls: snapshot.val() });
    });
  };

  activePollListener = () => {
    if (this.paths.activePollListener) {
      database.ref(this.paths.activePollListener).off();
    }

    this.paths.activePollListener = `/broadcasters/${this.state
      .userId}/activepoll`;
    database.ref(this.paths.activePollListener).on("value", snapshot => {
      this.setState({ activePoll: snapshot.val() });
    });
  };

  handlePollSelected = e => {
    this.clearStatusMsg();
    const selectedPollTitle = e.target.options[e.target.selectedIndex].text;
    const selectedPoll = e.target.value;
    this.setState({ selectedPoll, selectedPollTitle });
  };

  handleSetActivePoll = () => {
    if (this.state.selectedPoll === "select") return;

    database
      .ref(`/broadcasters/${this.state.userId}/activepoll`)
      .set({
        poll: this.state.selectedPoll,
        pollTitle: this.state.selectedPollTitle
      })
      .then(() => {
        this.setState({ selectedPoll: "select" });
      })
      .catch(() => {
        this.setStatusMsg("Error setting active poll. Refresh and try again.");
      });
  };

  handleUnsetActivePoll = () => {
    if (!this.state.activePoll) {
      return;
    }

    database
      .ref(`/broadcasters/${this.state.userId}/activepoll`)
      .set(false)
      .then(() => {
        this.setState({ selectedPoll: "select" });
      })
      .catch(() => {
        this.setStatusMsg(
          "Error unsetting active poll. Refresh and try again."
        );
      });
  };

  clearStatusMsg = () => this.setState({ statusMsg: "" });

  setStatusMsg = s => this.setState({ statusMsg: s });

  render() {
    if (!this.state.googleJwt) {
      return <h2>Loading...</h2>;
    }

    return (
      <div className="App p-05">
        {this.state.statusMsg && (
          <p className="error-msg">{this.state.statusMsg}</p>
        )}
        <p>
          <strong>Current Active Poll</strong>:<br />
          {this.state.activePoll ? (
            this.state.activePoll.pollTitle
          ) : (
            <em>No poll active.</em>
          )}
        </p>
        <PollSelector
          polls={this.state.polls}
          selectedPoll={this.state.selectedPoll}
          pollSelected={this.handlePollSelected}
          setActivePoll={this.handleSetActivePoll}
          unsetActivePoll={this.handleUnsetActivePoll}
        />
        <small className="mt-05 d-block">
          Add new polls using the configuartion page in the extension manager.<br />
          <a
            href="https://www.twitch.tv/videos/177832224"
            className="mt-025"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch How
          </a>
        </small>
      </div>
    );
  }
}

export default App;
