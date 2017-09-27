import React, { Component } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import throttle from "lodash.throttle";
import { database, auth as googleAuth } from "../../../server/firebase_config";

import PaneHome from "./PaneHome";
import PanePolling from "./PanePolling";
import PaneResults from "./PaneResults";
import appButtonImg from "../../media/app-button.png";
import appButtonClose from "../../media/app-button-close.png";

class App extends Component {
  constructor(props) {
    super(props);

    this.googleAuthUrl =
      "https://us-central1-yaynaynay-ext.cloudfunctions.net/twitchToFirebaseAuth";

    this.timerId = 0;
    this.handleMouseMove = throttle(this.handleMouseMove, 200);

    this.paths = {
      activePollListener: null,
      takenPollsListener: null,
      questionsListener: null
    };

    this.state = {
      minimized: true,
      jwt: "",
      role: "",
      userId: "",
      googleJwt: "",
      channelId: "",
      activePoll: false,
      takenPolls: {},
      statusMsg: "",
      pane: "home",
      questions: {}
    };
  }

  componentDidMount() {
    if (window.Twitch.ext) {
      window.Twitch.ext.onAuthorized(auth => {
        const jwt = auth.token;
        const jwtDecoded = jwtDecode(auth.token);
        const role = jwtDecoded.role;
        const userId = jwtDecoded.user_id;
        const channelId = jwtDecoded.channel_id;

        this.setState({
          jwt,
          role,
          userId,
          channelId
        });

        if (userId !== undefined) this.authWithGoogle(jwt);
      });
    }
  }

  componentWillUnmount() {
    if (this.paths.activePollListener) {
      database.ref(this.paths.activePollListener).off();
    }
    if (this.paths.takenPollsListener) {
      database.ref(this.paths.takenPollsListener).off();
    }
    if (this.paths.questionsListener) {
      database.ref(this.paths.questionsListener).off();
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
        this.takenPollsListener();
        this.activePollListener();
      })
      .catch(() => {
        throw new Error("Error in auth or database flow.");
      });
  };

  takenPollsListener = () => {
    if (this.paths.takenPollsListener) {
      database.ref(this.paths.takenPollsListener).off();
    }

    this.paths.takenPollsListener = `/voters/${this.state.userId}/polls`;
    database.ref(this.paths.takenPollsListener).on("value", snapshot => {
      if (!snapshot.val()) {
        this.setState({ takenPolls: {} });
      } else {
        this.setState({ takenPolls: snapshot.val() });
      }
    });
  };

  activePollListener = () => {
    if (this.paths.activePollListener) {
      database.ref(this.paths.activePollListener).off();
    }

    this.paths.activePollListener = `/broadcasters/${this.state
      .channelId}/activepoll`;
    database.ref(this.paths.activePollListener).on("value", snapshot => {
      this.setState({ activePoll: snapshot.val() }, () => {
        this.questionsListener();
      });
    });
  };

  questionsListener = () => {
    if (this.paths.questionsListener) {
      database.ref(this.paths.questionsListener).off();
    }

    if (!this.state.activePoll) return;

    this.paths.questionsListener = `/polls/${this.state.channelId}/${this.state
      .activePoll.poll}/questions`;
    database.ref(this.paths.questionsListener).on("value", snapshot => {
      if (!snapshot.val()) {
        this.setState({ questions: {} });
      } else {
        this.setState({ questions: snapshot.val() });
      }
    });
  };

  handleMinimize = () => {
    clearTimeout(this.timerId);
    const el = document.querySelector(".PollPanel");

    if (this.state.minimized) {
      el.classList.remove("hidden", "slideOutRight");
      el.classList.add("slideInRight", "animated");
    } else {
      el.classList.remove("slideInRight");
      el.classList.add("slideOutRight");
    }

    this.setState({ minimized: !this.state.minimized });
  };

  checkIfTookPoll = () => {
    const poll = this.state.activePoll.poll;
    if (this.state.takenPolls[poll]) return true;
    return false;
  };

  submitPoll = questions => {
    const updates = {};
    questions.forEach((question, i) => {
      updates[
        `/results/${this.state.activePoll.poll}/q${i}/voters/${this.state
          .userId}`
      ] =
        question.answer;
    });

    database
      .ref()
      .update(updates)
      .then(() => {
        this.setPane("results");
      })
      .catch(() => {
        this.setPane("home");
      });
  };

  setPane = pane => {
    this.setState({ pane });
  };

  handleMouseMove = () => {
    if (!this.state.minimized) return;

    const el = document.querySelector(".App");

    el.classList.remove("invis");
    el.classList.add("vis");

    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      el.classList.remove("vis");
      el.classList.add("invis");
    }, 2500);
  };

  render() {
    let pane;
    if (this.state.pane === "polling") {
      pane = (
        <PanePolling
          activePoll={this.state.activePoll}
          setPane={this.setPane}
          submitPoll={this.submitPoll}
          questions={this.state.questions}
        />
      );
    } else if (this.state.pane === "results") {
      pane = (
        <PaneResults
          activePoll={this.state.activePoll}
          setPane={this.setPane}
          questions={this.state.questions}
        />
      );
    } else {
      pane = (
        <PaneHome
          isGoogleAuthed={this.state.googleJwt}
          activePoll={this.state.activePoll}
          checkIfTookPoll={this.checkIfTookPoll}
          setPane={this.setPane}
        />
      );
    }

    return (
      <div className="App" onMouseMove={this.handleMouseMove}>
        <div className="PollPanel hidden">{pane}</div>
        <div
          className="app-button"
          onClick={this.handleMinimize}
          role="button"
          tabIndex={0}
        >
          <img
            src={this.state.minimized ? appButtonImg : appButtonClose}
            alt="YayNayNay app button"
          />
        </div>
      </div>
    );
  }
}

export default App;
