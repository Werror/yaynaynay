import React from "react";
import { render } from "react-dom";

import App from "./components/App";
import "../commons.scss";
import "./live_config.scss";

render(<App />, document.getElementById("app"));
