export interface IEmitter<NS, PROP, VAL> {
  set: (key: PROP, value: VAL) => void;
  get: (key: PROP) => VAL;
  add: (ns: NS, key: PROP, value: VAL) => void;
  emit: (ns: NS) => void;
  toString: () => string;
}
