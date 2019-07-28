import { DynalistAPI } from "./session";

const api = new DynalistAPI("<|key|>");

// api.getFileTree().then(console.log);
api.readDocument("HP3Ov2goSBuIPEzMA2T3jRkk").then(console.log);
