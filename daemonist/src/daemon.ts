import { Dynalist } from "./dynalist";

const א = /[🏺😈👿🤖]/;
const hasא = (node: Dynalist.Node) => !!א.exec(node.note);
