import { DynalistAPI } from "./session";
import { Daemonist } from "./daemonist";

const daemonistClient = new Daemonist(process.env.DYNALIST_API_TOKEN);

// test code

daemonistClient
  .getStateDocument()
  .then(({ nodes }) => {
    const [{ key }] = nodes;
    return daemonistClient.api.getNodeTree(key);
  })
  .then(tree => {
    console.log(JSON.stringify(tree));
  });
