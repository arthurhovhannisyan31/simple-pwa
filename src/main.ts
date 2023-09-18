import {
ASSET_PATH,
logout,
notifyMe,
connectClients,
} from "./helpers";
import { SWManager } from "./service-workers/managers/sw-manager";
import image from "./static/img/batman.png";
import version from "../assets/version.json";

import "./style.css";

console.log("MainJS", version);

const root = document.querySelector("#root");
if (root) {
  root.innerHTML = `
  <img src=${image}>
  <button id="here">Fetch</button>
  <button id="notify">Notify</button>
  <button id="logout">Logout</button>
  <button id="connect-clients">Connect clients</button>
<!--  <button id="connect-clients">Connect clients</button>-->
`;
}

let serviceWorker: SWManager;

// TODO unregister case
// Progressive Enhancement (SW supported)
if (navigator.serviceWorker) {
  serviceWorker = await SWManager.register("service-worker.js", {
    type: "module",
    updateViaCache: "all",
    scope: ASSET_PATH,
  });
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
