/**
 * Used to synchronize access to states.
 */
export class Mutex {
  private _locked = false;
  private readonly _waiting: Function[] = [];

  lock(): Promise<void> {
    return new Promise((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve();
        return;
      }

      this._waiting.push(resolve);
    });
  }

  unlock(): void {
    const resolve = this._waiting.shift();
    if (resolve) {
      resolve();
    } else {
      this._locked = false;
    }
  }
}

/**
 * Helper function to get the latest value of state from useState hook.
 *
 * @param setState
 */
export const getValueFromSetState = <T>(setState: (updater: (prev: T) => T) => void): Promise<T> => {
  return new Promise<T>((resolve) => {
    setState((prev) => {
      resolve(prev);
      return prev;
    });
  });
}
