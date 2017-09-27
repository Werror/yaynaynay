import React from "react";

import grantAccess from "../../media/grant-access.png";

export default function(props) {
  let content;

  if (!props.isGoogleAuthed) {
    content = (
      <div className="noAuth">
        <p className="mt-1">
          Please grant access to YayNayNay before taking a poll.
        </p>
        <img src={grantAccess} alt="grant access" className="mt-05 br-5" />
      </div>
    );
  } else if (!props.activePoll) {
    content = (
      <p className="mt-1">The broadcaster doesn&rsquo;t have an active poll.</p>
    );
  } else {
    const userHasTakenPoll = props.checkIfTookPoll();
    content = (
      <div>
        <p className="pollTitle py-05">{props.activePoll.pollTitle}</p>
        {userHasTakenPoll ? (
          <p className="mt-05">You&rsquo;ve already taken this poll.</p>
        ) : (
          <div
            className="btn mx-auto mt-05"
            onClick={() => props.setPane("polling")}
            role="button"
            tabIndex={0}
          >
            Take Poll Now
          </div>
        )}
        <div
          className="btn mx-auto mt-05"
          onClick={() => props.setPane("results")}
          role="button"
          tabIndex={0}
        >
          View Poll Results
        </div>
      </div>
    );
  }

  return <div className="PaneHome">{content}</div>;
}
