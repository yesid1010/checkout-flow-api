const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly address: string) {}

  static create(address: string): Email {
    const trimmed = address.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email address: ${address}`);
    }
    return new Email(trimmed);
  }

  get value(): string {
    return this.address;
  }

  equals(other: Email): boolean {
    return this.address === other.address;
  }
}
