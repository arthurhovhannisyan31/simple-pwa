import { notifyMe } from "./helpers";
import { SWManager } from "./service-workers/sw-manager";
import image from "./thumb.png";
import version from "../assets/version.json";

import "./style.css";

console.log("MainJS", version);

const root = document.querySelector("#root");
if (root) {
  root.innerHTML = `
  <h1>Page 1</h1>
  <img src=${image}>
  <button id="here">Fetch</button>
  <button id="notify">Notify</button>
  <p>Nullam quis risus eget urna mollis ornare vel eu leo. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui. Donec sed odio dui. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
`;
}

let serviceWorker: SWManager;

// Progressive Enhancement (SW supported)
if (navigator.serviceWorker) {
  serviceWorker = await SWManager.register("service-worker.js", {
    type: "module",
    updateViaCache: "all",
  });
  // console.log("serviceWorker.registration", serviceWorker.registration);
}

function click(): void {
  fetch("https://jsonplaceholder.typicode.com/todos/1");
}

const hereBtn = document.getElementById("here");
hereBtn?.addEventListener("click", click);

const notifyBtn = document.getElementById("notify");
notifyBtn?.addEventListener("click", () => notifyMe(serviceWorker));
