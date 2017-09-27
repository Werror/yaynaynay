import React, { Component } from "react";

class PaneResults extends Component {
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

    if (nextProps.questions) {
      const questions = Object.keys(nextProps.questions).map(
        question => nextProps.questions[question]
      );

      this.setState({ questions });
    }
  }

  incrementCurrentIndex = () => {
    const nextIndex = this.state.currentIndex + 1;
    if (nextIndex < this.state.questions.length) {
      this.setState({ currentIndex: nextIndex });
    } else {
      this.setState({ currentIndex: 0 });
    }
  };

  render() {
    if (
      Object.keys(this.props.questions).length < 1 ||
      !this.props.activePoll
    ) {
      return <p>Loading...</p>;
    }

    return (
      <div className="PaneResults">
        <div className="results">
          <div className="pollTitle py-05">
            <div
              className="fl ml-05 goHome"
              onClick={() => this.props.setPane("home")}
              role="button"
              tabIndex={0}
            >
              &#8617; Home
            </div>
            <p className="fr mr-05">
              Question #{this.state.currentIndex + 1} of{" "}
              {this.state.questions.length}
            </p>
          </div>

          <p>{this.state.questions[this.state.currentIndex].text}</p>

          <div className="yayNay mb-05">
            <p className="yayCount">
              YAYS: {this.state.questions[this.state.currentIndex].yays || 0}
            </p>
            <p className="nayCount">
              NAYS: {this.state.questions[this.state.currentIndex].nays || 0}
            </p>
          </div>

          {this.state.questions.length > 1 && (
            <div
              className="btn-next mb-05 mx-auto"
              onClick={this.incrementCurrentIndex}
              role="button"
              tabIndex={0}
            >
              Next Question
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PaneResults;
