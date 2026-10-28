import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import "popper.js";
import "bootstrap/dist/css/bootstrap.css";
import "./css/mobile.scss";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "react-tabs/style/react-tabs.css";
import "react-datepicker/dist/react-datepicker.css";
// import UnderMaintenance from "./pages/UnderMaintenance";

const maintenance = false;

ReactDOM.render(
  <BrowserRouter basename="/">
    {maintenance ? null : <App />}
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
