import React from "react";

export default function({ i, value, onChange }) {
  return (
    <div className="question">
      <label htmlFor={`q${i}`} className="mt-1 d-block">
        Question #{i + 1}
      </label>
      <input
        className="newPoll-input"
        type="text"
        id={`q${i}`}
        value={value}
        onChange={onChange}
        maxLength="70"
      />
    </div>
  );
}
