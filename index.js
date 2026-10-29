/**
 * Host half of the Session Cost Meter bundle.
 *
 * Everything the user sees is owned by the Client half: it reads the durable
 * `tokenUsage` projection and calls the account Remote for the wallet balance.
 * The Host half is intentionally empty, so the bundle needs no Host services
 * beyond the standard profile composition.
 */
export function apply() {}
