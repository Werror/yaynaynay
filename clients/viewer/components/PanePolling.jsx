import React, { Component } from "react";

class PanePolling extends Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: [],
      currentIndex: 0
    };
  }

  componentWillMount() {
    if (this.props.questions) {
      const questions = Object.keys(this.props.questions).map(
        question => this.props.questions[question]
      );
      this.setState({ questions });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.activePoll ||
      nextProps.activePoll.poll !== this.props.activePoll.poll
    ) {
      this.props.setPane("home");
    }
  }

  recordAnswer = answer => {
    const questions = this.state.questions.slice(0);
    questions[this.state.currentIndex].answer = answer;
    this.setState({ questions });
    this.checkNextQuestion();
  };

  checkNextQuestion = () => {
    const nextIndex = this.state.currentIndex + 1;
    if (nextIndex < this.state.questions.length) {
      this.setState({ currentIndex: nextIndex });
    } else {
      this.props.submitPoll(this.state.questions);
    }
  };

  render() {
    if (!this.props.questions || !this.props.activePoll) {
      return <p>Loading...</p>;
    }

    return (
      <div className="PanePolling">
        <div className="questionAnswer">
          <p className="pollTitle py-05">
            Question #{this.state.currentIndex + 1}
          </p>
          <p className="mt-05">
            {this.state.questions[this.state.currentIndex].text}
          </p>
          <div className="yayNay mb-05">
            <div
              onClick={() => this.recordAnswer(true)}
              className="btn-yay mx-auto mt-05"
              role="button"
              tabIndex={0}
            >
              YAY
            </div>
            <div
              onClick={() => this.recordAnswer(false)}
              className="btn-nay mx-auto mt-05"
              role="button"
              tabIndex={0}
            >
              NAY
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PanePolling;
