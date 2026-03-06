/**
 * Tests for trial/premium business logic.
 * These verify the pure logic extracted from edge functions,
 * not the HTTP layer itself.
 */

type Profile = { trial_started_at: string | null } | null;

function hasUsedTrial(profile: Profile): boolean {
  return !!profile?.trial_started_at;
}

function isPremiumActive(
  is_premium: boolean | null,
  premium_expires_at: string | null,
): boolean {
  return (
    !!is_premium &&
    (!premium_expires_at || new Date(premium_expires_at) > new Date())
  );
}

describe("trial guard logic", () => {
  it("rejects trial if trial_started_at is already set", () => {
    expect(hasUsedTrial({ trial_started_at: "2026-01-01T00:00:00Z" })).toBe(true);
  });

  it("allows trial if trial_started_at is null", () => {
    expect(hasUsedTrial({ trial_started_at: null })).toBe(false);
  });

  it("allows trial if no profile exists yet", () => {
    expect(hasUsedTrial(null)).toBe(false);
  });
});

describe("premium expiry check", () => {
  it("returns true when premium and not expired", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isPremiumActive(true, future)).toBe(true);
  });

  it("returns false when premium has expired", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(isPremiumActive(true, past)).toBe(false);
  });

  it("returns true when premium with no expiry (lifetime)", () => {
    expect(isPremiumActive(true, null)).toBe(true);
  });

  it("returns false when is_premium is false", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isPremiumActive(false, future)).toBe(false);
  });

  it("returns false when is_premium is null", () => {
    expect(isPremiumActive(null, null)).toBe(false);
  });
});
