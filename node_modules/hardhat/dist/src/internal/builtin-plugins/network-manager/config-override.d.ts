import type { NetworkConfig, NetworkConfigOverride, NetworkUserConfig } from "../../../types/config.js";
/**
 * Converts the NetworkConfigOverride into a valid NetworkUserConfig. This
 * function determines the network type based on the provided `networkConfig`
 * and sets default values for any required properties that are missing from
 * the `networkConfigOverride`.
 *
 * @warning
 * This function is not type-safe. It assumes that `networkConfigOverride` does
 * not contain mixed properties from different network types. Always validate
 * the resulting NetworkUserConfig before using it.
 *
 * @param networkConfigOverride The partial configuration override provided by
 * the user.
 * @param networkConfig The base network configuration used to infer defaults
 * and the network type.
 * @returns A fully resolved NetworkUserConfig with defaults applied.
 */
export declare function normalizeNetworkConfigOverride(networkConfigOverride: NetworkConfigOverride, networkConfig: NetworkConfig): Promise<NetworkUserConfig>;
//# sourceMappingURL=config-override.d.ts.map