import { DynalistAPI } from "./session";
import { Daemonist } from "./daemonist";
import { DateDaemon } from "./daemons/dateDaemon";

const daemonistClient = new Daemonist(process.env.DYNALIST_API_TOKEN, true);

// test code

daemonistClient.registerDaemon(new DateDaemon());
setInterval(daemonistClient.runAllDaemons, 10000);
