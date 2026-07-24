export class Result<T, E = Error> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static err<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isOk(): boolean {
    return this._isOk;
  }

  get isErr(): boolean {
    return !this._isOk;
  }

  get value(): T {
    if (!this._isOk) {
      throw new Error('Cannot read value of an Err result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isOk) {
      throw new Error('Cannot read error of an Ok result');
    }
    return this._error as E;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return this._isOk
      ? Result.ok<U, E>(fn(this._value as T))
      : Result.err<U, E>(this._error as E);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return this._isOk
      ? Result.ok<T, F>(this._value as T)
      : Result.err<T, F>(fn(this._error as E));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this._isOk ? fn(this._value as T) : Result.err<U, E>(this._error as E);
  }

  async flatMapAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return this._isOk ? fn(this._value as T) : Result.err<U, E>(this._error as E);
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._isOk ? handlers.ok(this._value as T) : handlers.err(this._error as E);
  }

  getOrElse(defaultValue: T): T {
    return this._isOk ? (this._value as T) : defaultValue;
  }
}
