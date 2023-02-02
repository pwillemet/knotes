export {}

declare global {
  interface Array<T> {
    extract(predicate: (e: T) => boolean): [T|null, Array<T>];
  }
}

if (!Array.prototype.extract) {
  Array.prototype.extract = function<T>(this: T[], predicate: (e: T) => boolean): [T|null, T[]]{
    const arr: T[] = [];
    let extracted = null;
    for (let i = 0; i < this.length; i++) {
      const item = this[i];
      if (predicate(item)) extracted = item;
      else arr.push(item);
    }
    return [extracted, arr];
  }
}
