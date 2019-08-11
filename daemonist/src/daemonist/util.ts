import { DynalistModel } from "../dynalist/dynalist-model";

export function unpackDynalistLink(link: string): DynalistModel.NodeKey | null {
  const LINK = /\(https?:\/\/dynalist.io\/d\/(.*)#z=(.*)\)/;
  const matches = LINK.exec(link);
  if (matches === null) return null;
  const [_, documentId, nodeId] = matches;
  return { documentId, nodeId };
}

export function yesterday(): Date {
  const day = new Date();
  day.setDate(day.getDate() - 1);
  return day;
}
