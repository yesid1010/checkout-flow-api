import { Email } from './email.vo';

describe('Email', () => {
  it('creates a valid email, normalized to lowercase and trimmed', () => {
    const email = Email.create('  Someone@Example.com  ');

    expect(email.value).toBe('someone@example.com');
  });

  it.each(['not-an-email', 'missing-domain@', '@missing-local.com', 'spaces in@email.com'])(
    'rejects invalid email %s',
    (invalid) => {
      expect(() => Email.create(invalid)).toThrow(`Invalid email address: ${invalid}`);
    },
  );

  it('compares equality by normalized address', () => {
    const a = Email.create('someone@example.com');
    const b = Email.create('SOMEONE@example.com');
    const c = Email.create('other@example.com');

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
