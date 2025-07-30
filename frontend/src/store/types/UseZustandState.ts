export type ZustandSetFunction<T> = (payload: T) => void;

export type UseZustandState<T> = [
  T,
  ZustandSetFunction<T>
]