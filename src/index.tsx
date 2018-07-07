import "./assets/styles.scss";

import * as React from "react";
import { render } from "react-dom";

import { Lexicon } from "./lexicon";

import { App } from "./components/App";

render(<App lexicon={new Lexicon()} />, document.getElementById("root"));
