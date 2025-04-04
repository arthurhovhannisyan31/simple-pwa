import {
logout,
notifyMe,
connectClients,
unregisterSW,
} from "./helpers";
import version from "../assets/version.json";
import { SWManager } from "./service-workers/managers/sw-manager";
import image from "./static/img/batman.png";

import "./style.css";

console.log("MainJS", version);

const root = document.querySelector("#root");
if (root) {
  root.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: flex-start">
    <img src=${image}>
    <button id="here">Fetch</button>
    <button id="notify">Notify</button>
    <button id="logout">Logout</button>
    <button id="connect-clients">Connect clients</button>
    <button id="unregister-sw">Unregister</button>
  </div>
`;
}

let serviceWorker: SWManager;

// Progressive Enhancement (SW supported)
if (navigator.serviceWorker) {
  try {
    serviceWorker = await SWManager.register("service-worker.js", {
      type: "module",
      updateViaCache: "all",
      scope: "/",
    });
  } catch (err) {
    console.log(err);
  }
}

function click(): void {
  fetch("https://jsonplaceholder.typicode.com/todos/1");
}

const hereBtn = document.getElementById("here");
hereBtn?.addEventListener("click", click);

const notifyBtn = document.getElementById("notify");
notifyBtn?.addEventListener("click", () => notifyMe(serviceWorker));

const logoutBtn = document.getElementById("logout");
logoutBtn?.addEventListener("click", () => logout(serviceWorker));

const connectClientsBtn = document.getElementById("connect-clients");
connectClientsBtn?.addEventListener("click", () => connectClients(serviceWorker));

const unregisterSWBtn = document.getElementById("unregister-sw");
unregisterSWBtn?.addEventListener("click", () => unregisterSW(serviceWorker));
