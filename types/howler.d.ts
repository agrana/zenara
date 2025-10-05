declare module 'howler' {
  export type HowlErrorCallback = (id: number, error: unknown) => void;

  export class Howl {
    constructor(options: any);
    play(): void;
    pause(): void;
    stop(): void;
    fade(from: number, to: number, duration: number): void;
    volume(vol?: number): number;
    state(): string;
    once(event: string, callback: () => void): void;
  }

  export class Howler {
    static ctx: AudioContext;
    static autoUnlock: boolean;
    static html5PoolSize: number;
    static noAudio: boolean;
    static usingWebAudio: boolean;
    static volume(vol?: number): number;
    static mute(muted: boolean): void;
    static unload(): void;
  }
}
