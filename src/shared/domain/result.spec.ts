import { Result } from './result';

describe('Result', () => {
  it('creates an Ok result carrying a value', () => {
    const result = Result.ok<number>(42);

    expect(result.isOk).toBe(true);
    expect(result.isErr).toBe(false);
    expect(result.value).toBe(42);
  });

  it('creates an Err result carrying an error', () => {
    const result = Result.err<number, string>('boom');

    expect(result.isErr).toBe(true);
    expect(result.isOk).toBe(false);
    expect(result.error).toBe('boom');
  });

  it('throws when reading the value of an Err result', () => {
    const result = Result.err<number, string>('boom');

    expect(() => result.value).toThrow('Cannot read value of an Err result');
  });

  it('throws when reading the error of an Ok result', () => {
    const result = Result.ok<number, string>(1);

    expect(() => result.error).toThrow('Cannot read error of an Ok result');
  });

  it('map transforms the value on Ok and is skipped on Err', () => {
    const ok = Result.ok<number, string>(2).map((v) => v * 2);
    const err = Result.err<number, string>('boom').map((v) => v * 2);

    expect(ok.value).toBe(4);
    expect(err.isErr).toBe(true);
    expect(err.error).toBe('boom');
  });

  it('mapErr transforms the error on Err and is skipped on Ok', () => {
    const err = Result.err<number, string>('boom').mapErr((e) => e.toUpperCase());
    const ok = Result.ok<number, string>(2).mapErr((e) => e.toUpperCase());

    expect(err.error).toBe('BOOM');
    expect(ok.value).toBe(2);
  });

  it('flatMap chains Ok results and short-circuits on Err', () => {
    const chained = Result.ok<number, string>(2).flatMap((v) =>
      Result.ok<number, string>(v + 1),
    );
    const shortCircuited = Result.err<number, string>('boom').flatMap((v) =>
      Result.ok<number, string>(v + 1),
    );

    expect(chained.value).toBe(3);
    expect(shortCircuited.isErr).toBe(true);
  });

  it('flatMapAsync chains async Ok results and short-circuits on Err', async () => {
    const chained = await Result.ok<number, string>(2).flatMapAsync(async (v) =>
      Result.ok<number, string>(v + 1),
    );
    const shortCircuited = await Result.err<number, string>('boom').flatMapAsync(
      async (v) => Result.ok<number, string>(v + 1),
    );

    expect(chained.value).toBe(3);
    expect(shortCircuited.isErr).toBe(true);
  });

  it('match dispatches to the ok or err handler', () => {
    const okOutcome = Result.ok<number, string>(2).match({
      ok: (v) => `ok:${v}`,
      err: (e) => `err:${e}`,
    });
    const errOutcome = Result.err<number, string>('boom').match({
      ok: (v) => `ok:${v}`,
      err: (e) => `err:${e}`,
    });

    expect(okOutcome).toBe('ok:2');
    expect(errOutcome).toBe('err:boom');
  });

  it('getOrElse returns the value on Ok and the default on Err', () => {
    expect(Result.ok<number, string>(2).getOrElse(0)).toBe(2);
    expect(Result.err<number, string>('boom').getOrElse(0)).toBe(0);
  });
});
