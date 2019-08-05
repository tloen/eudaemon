import { DynalistClient } from "./api/dynalist-client";
import { Daemonist } from "./daemonist";
import { DateDaemon } from "./daemons/dateDaemon";

const daemonistClient = new Daemonist(process.env.DYNALIST_API_TOKEN, true);

// test code

daemonistClient.registerDaemon(new DateDaemon());
daemonistClient.runAllDaemons().then(() => {
  setInterval(daemonistClient.runAllDaemons, 2000);
});
