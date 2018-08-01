import { Option } from "../optional";
import { Sink, Subscribe, Unsub } from "../types";
/** @hidden */
export default function streamSubscribeToPropertySubscribe<V>(initValue: Option<V>, streamSubscribe: Subscribe<V>): (sink: Sink<V>) => Unsub;
