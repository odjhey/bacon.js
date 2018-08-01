import Observable from "../observable";
import { EventSink, Unsub } from "../types";
interface Event<V> {
    value: V;
}
/** @hidden */
export declare abstract class Source<In, Out> {
    _isSource: boolean;
    obs: Observable<In>;
    sync: boolean;
    flatten: boolean;
    ended: boolean;
    constructor(obs: Observable<In>, sync: boolean);
    subscribe(sink: EventSink<In>): Unsub;
    toString(): string;
    markEnded(): void;
    abstract consume(): Event<Out> | undefined;
    mayHave(count: any): boolean;
    abstract hasAtLeast(count: any): boolean;
    abstract push(event: Event<In>): any;
}
/** @hidden */
export declare class DefaultSource<V> extends Source<V, V> {
    value: Event<V> | undefined;
    consume(): Event<V> | undefined;
    push(x: Event<V>): void;
    hasAtLeast(c: any): boolean;
}
/** @hidden */
export declare class ConsumingSource<V> extends Source<V, V> {
    flatten: boolean;
    queue: Event<V>[];
    constructor(obs: Observable<V>, sync: any);
    consume(): Event<V> | undefined;
    push(x: Event<V>): number;
    mayHave(count: any): boolean;
    hasAtLeast(count: any): boolean;
}
/** @hidden */
export declare class BufferingSource<V> extends Source<V, V[]> {
    queue: V[];
    constructor(obs: any);
    consume(): Event<V[]>;
    push(x: Event<V>): number;
    hasAtLeast(count: any): boolean;
}
/** @hidden */
export declare function isTrigger(s: any): boolean;
/** @hidden */
export declare function fromObservable<V>(s: Source<V, V> | Observable<V>): Source<V, V>;
export {};
