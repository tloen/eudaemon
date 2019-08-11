import { Daemonist } from "./daemonist/daemonist";
import { DashboardDaemon } from "./dashboard/dashboardDaemon";

const daemonistClient = new Daemonist(process.env.DYNALIST_API_TOKEN, true);

// test code

daemonistClient.registerDaemon(new DashboardDaemon());
daemonistClient.runAllDaemons().then(() => {
  setInterval(daemonistClient.runAllDaemons, 1000000);
});
