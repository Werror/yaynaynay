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
    <div className="PollSelector mt-1">
      <form>
        <label htmlFor="pollSelector">Select A Poll</label>
        <select
          onChange={props.pollSelected}
          value={props.selectedPoll}
          id="pollSelector"
          className="pollSelector mt-05"
        >
          <option value="select">select poll</option>
          {polls}
        </select>
      </form>
      <div
        onClick={props.newPoll}
        className="btn-add mt-05 mx-auto"
        role="button"
        tabIndex={0}
      >
        Add New Poll
      </div>
      <div
        onClick={props.deleteSelectedPoll}
        className={`btn-del mt-05 mx-auto ${props.selectedPoll === "select"
          ? "cantDelete"
          : ""}`}
        role="button"
        tabIndex={0}
        disabled={props.selectedPoll === "select"}
      >
        Delete Selected Poll
      </div>

      <ul className="list mt-2">
        <li>
          Viewers can only view results or vote on your currently set active
          poll. You can unset/set your active poll from the Live Dashboard.
        </li>
        <li>
          Viewers must be logged in to their Twitch accounts and allow the
          extension to see their Twitch Id before using the extension. This
          helps prevent against multiple votes.
        </li>
        <li>
          Viewers can&rsquo;t see the extension if their video player size is
          too small. They should make sure they have granted access properly and
          enlarged the video player size. Twitch video overlay exntensions are
          only available on desktop web browsers (not app or mobile).
        </li>
      </ul>
    </div>
  );
}
