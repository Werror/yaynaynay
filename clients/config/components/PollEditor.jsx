import React, { Component } from "react";

import PollQuestion from "./PollQuestion";

class PollEditor extends Component {
  constructor(props) {
    super(props);

    this.numberOfQuestionsToCreate = 10;
    this.err1 = "Your poll must have a title and at least one question.";

    this.state = {
      owner: this.props.owner,
      pollTitle: "",
      questions: null
    };
  }

  componentWillMount() {
    this.props.clearStatusMsg();
    const questions = [];
    for (let i = 0; i < this.numberOfQuestionsToCreate; i++) {
      questions.push({ text: "" });
    }
    this.setState({ questions });
  }

  validateSavePoll = () => {
    // No title error.
    if (!this.state.pollTitle) {
      this.props.setStatusMsg(this.err1);
      return;
    }

    // No questions error.
    let hasAtLeastOneQuestion = false;
    for (let i = 0; i < this.numberOfQuestionsToCreate; i++) {
      if (this.state.questions[i].text) {
        hasAtLeastOneQuestion = true;
        break;
      }
    }
    if (!hasAtLeastOneQuestion) {
      this.props.setStatusMsg(this.err1);
      return;
    }

    const pollObj = {
      title: this.state.pollTitle,
      owner: this.state.owner,
      questions: {}
    };

    this.state.questions
      .filter(question => {
        if (question.text) return question;
        return false;
      })
      .map((question, i) => {
        const keyLabel = `q${i}`;
        pollObj.questions[keyLabel] = question;
        return null;
      });

    this.props.handleSavePoll(pollObj);
  };

  handleChange = e => {
    const questionId = e.target.getAttribute("id")[1];
    const questions = this.state.questions.slice(0);
    questions[questionId].text = e.target.value;

    this.props.clearStatusMsg();
    this.setState({ questions });
  };

  handleTitleChange = e => {
    this.props.clearStatusMsg();
    this.setState({ pollTitle: e.target.value });
  };

  renderQuestions = () =>
    this.state.questions.map((question, i) => (
      <PollQuestion
        key={i} // eslint-disable-line react/no-array-index-key
        i={i}
        value={this.state.questions[i].text}
        onChange={this.handleChange}
      />
    ));

  backNoSave = () => {
    this.props.clearStatusMsg();
    this.props.toggleIsEditingPoll();
  };

  render() {
    return (
      <div className="PollEditor mt-1">
        <ul className="list">
          <li>
            Be sure to check your spelling, you can&rsquo;t edit your poll once
            it&rsquo;s saved!
          </li>
          <li>
            Your poll has a max of 10 questions. If you need less, just leave
            them blank.
          </li>
          <li>
            Your questions should be statements that can simply be answered with
            YAY or NAY.
          </li>
          <li>
            Poll titles and questions are limited to 70 characters. Keep it
            short and sweet!
          </li>
        </ul>

        <form onSubmit={e => e.preventDefault()} className="mt-2">
          <label htmlFor="pollTitle" className="mt-1 d-block fs-20">
            Poll Title
          </label>
          <input
            className="newPoll-input"
            type="text"
            id="pollTitle"
            value={this.state.pollTitle}
            onChange={this.handleTitleChange}
            maxLength="70"
          />
          {this.state.questions && this.renderQuestions()}
        </form>

        <div
          className="btn-add mt-1 mx-auto p-1"
          role="button"
          tabIndex={0}
          onClick={this.validateSavePoll}
        >
          Save Poll
        </div>
        <div
          className="btn-del mt-2 mb-05 mx-auto"
          role="button"
          tabIndex={0}
          onClick={this.backNoSave}
        >
          Don&lsquo;t Save &amp; Go Back
        </div>
      </div>
    );
  }
}

export default PollEditor;
