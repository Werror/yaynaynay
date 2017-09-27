import React from "react";

export default function(props) {
  let polls = [];
  if (props.polls) {
    polls = Object.keys(props.polls).map(poll => (
      <option value={poll} key={poll}>
        {props.polls[poll].title}
      </option>
    ));
  }

  return (
    <div className="PollSelector">
      <form className="mt-05">
        <label htmlFor="pollSelector">
          <strong>Select A Poll</strong>
        </label>
        <br />
        <select
          onChange={props.pollSelected}
          value={props.selectedPoll}
          id="pollSelector"
          className="pollSelector"
        >
          <option value="select">select poll</option>
          {polls}
        </select>
      </form>
      <div
        onClick={props.setActivePoll}
        className="btn-set mt-05 mx-auto"
        role="button"
        tabIndex={0}
      >
        Set Active Poll
      </div>
      <div
        onClick={props.unsetActivePoll}
        className="btn-unset mt-05 mx-auto"
        role="button"
        tabIndex={0}
      >
        Unset Active Poll
      </div>
    </div>
  );
}

/*

*/
