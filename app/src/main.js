import { hydrate, mount } from "svelte";
import App from "./App.svelte";

const target = document.getElementById("app");

const app = target?.hasChildNodes()
  ? hydrate(App, { target })
  : mount(App, { target });

export default app;
