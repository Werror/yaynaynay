import React from "react";
import { render } from "react-dom";

import App from "./components/App";
import "../commons.scss";
import "./viewer.scss";

render(<App />, document.getElementById("app"));
