import React, { Component } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { database, auth as googleAuth } from "../../../server/firebase_config";

import PollEditor from "./PollEditor";
import PollSelector from "./PollSelector";

class App extends Component {
  constructor(props) {
    super(props);

    this.googleAuthUrl =
      "https://us-central1-yaynaynay-ext.cloudfunctions.net/twitchToFirebaseAuth";

    this.paths = {
      pollsListener: null
    };

    this.state = {
      jwt: "",
      role: "",
      userId: "",
      googleJwt: "",
      polls: {},
      selectedPoll: "select",
      selectedPollTitle: "",
      isEditingPoll: false,
      statusMsg: ""
    };
  }

  componentDidMount() {
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

  componentWillUnmount() {
    if (this.paths.pollsListener) {
      database.ref(this.paths.pollsListener).off();
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

  handlePollSelected = e => {
    const selectedPollTitle = e.target.options[e.target.selectedIndex].text;
    const selectedPoll = e.target.value;
    this.setState({ selectedPoll, selectedPollTitle });
  };

  handleNewPoll = () => {
    this.setState({ selectedPoll: "select" }, () => {
      this.toggleIsEditingPoll();
    });
  };

  handleSavePoll = pollObj => {
    const updates = {};
    const pollKey = database
      .ref(`/broadcasters/${this.state.userId}/polls`)
      .push().key;
    updates[`/broadcasters/${this.state.userId}/polls/${pollKey}`] =
      pollObj.title;
    updates[`/polls/${this.state.userId}/${pollKey}`] = pollObj;

    database
      .ref()
      .update(updates)
      .then(() => {
        this.setStatusMsg(`Saved Poll: ${pollObj.title}`);
        this.toggleIsEditingPoll();
      })
      .catch(() => {
        this.setStatusMsg("Error saving poll. Verify info and try again.");
      });
  };

  handleDeleteSelectedPoll = () => {
    if (this.state.selectedPoll === "select") return;

    const updates = {};
    updates[
      `/broadcasters/${this.state.userId}/polls/${this.state.selectedPoll}`
    ] = null;

    database
      .ref()
      .update(updates)
      .then(() => {
        this.setStatusMsg(`Deleted Poll: ${this.state.selectedPollTitle}`);
        this.setState({ selectedPoll: "select" });
      })
      .catch(() => {
        this.setStatusMsg("Error deleting poll. Refresh and try again.");
      });
  };

  toggleIsEditingPoll = () => {
    this.setState({ isEditingPoll: !this.state.isEditingPoll });
  };

  clearStatusMsg = () => this.setState({ statusMsg: "" });

  setStatusMsg = s => this.setState({ statusMsg: s });

  render() {
    if (!this.state.googleJwt) {
      return <h2>Loading...</h2>;
    }

    return (
      <div className="App mx-auto">
        {this.state.statusMsg && (
          <p className="error-msg">{this.state.statusMsg}</p>
        )}

        {this.state.isEditingPoll ? (
          <PollEditor
            toggleIsEditingPoll={this.toggleIsEditingPoll}
            selectedPoll={this.state.selectedPoll}
            owner={this.state.userId}
            handleSavePoll={this.handleSavePoll}
            clearStatusMsg={this.clearStatusMsg}
            setStatusMsg={this.setStatusMsg}
          />
        ) : (
          <PollSelector
            polls={this.state.polls}
            selectedPoll={this.state.selectedPoll}
            pollSelected={this.handlePollSelected}
            newPoll={this.handleNewPoll}
            deleteSelectedPoll={this.handleDeleteSelectedPoll}
          />
        )}
      </div>
    );
  }
}

export default App;
