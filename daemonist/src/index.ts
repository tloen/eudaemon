import { DynalistAPI } from "./session";

const api = new DynalistAPI(process.env.DYNALIST_API_TOKEN);

// api.getFileTree().then(console.log);
// api.readDocument("HP3Ov2goSBuIPEzMA2T3jRkk").then(console.log);
// api.getAllDocuments().then(console.log);
api.getNodeForest().then(console.log);
