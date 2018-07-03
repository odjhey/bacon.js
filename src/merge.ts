import EventStream from "./eventstream";
import CompositeUnsubscribe from "./compositeunsubscribe";
import { argumentsToObservables } from "./argumentstoobservables";
import never from "./never";
import _ from "./_";
import { more, noMore } from "./reply";
import { Event, endEvent } from "./event";
import { Desc } from "./describe";
import Bacon from "./core";
import Observable from "./observable";
import { Unsub } from "./types";

export function mergeAll<V>(...streams: (Observable<V> | Observable<V>[])[]): EventStream<V> {
  streams = argumentsToObservables(streams);
  if (streams.length) {
    return new EventStream(new Desc(Bacon, "mergeAll", streams), function(sink) {
      var ends = 0
      var smartSink = function(obs: Observable<V>) {
        return function(unsubBoth: Unsub) {
          return obs.subscribeInternal(function(event: Event<V>) {
            if (event.isEnd) {
              ends++
              if (ends === streams.length) {
                return sink(endEvent())
              } else {
                return more
              }
            } else {
              var reply = sink(event)
              if (reply === noMore) { unsubBoth() }
              return reply
            }
          })
        }
      }
      var sinks = _.map(smartSink, streams);
      return new CompositeUnsubscribe(sinks).unsubscribe;
    })
  } else {
    return never()
  }
}

Bacon.mergeAll = mergeAll;
