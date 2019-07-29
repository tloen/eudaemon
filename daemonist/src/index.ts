import { DynalistAPI } from "./session";
import { Daemonist } from "./daemonist";

const daemonistClient = new Daemonist(process.env.DYNALIST_API_TOKEN);

// test code
daemonistClient
  .getActivatedNodeTrees()
  .then(x => console.log(JSON.stringify(x)));
