import type { EdrNetworkAccountConfig, EdrNetworkAccountsConfig, ChainDescriptorsConfig, EdrNetworkForkingConfig, EdrNetworkMempoolConfig, EdrNetworkMiningConfig } from "../../../../../types/config.js";
import type { ChainType } from "../../../../../types/network.js";
import type { RpcDebugTraceOutput } from "../types/output.js";
import type { IntervalRange, DebugTraceResult, ChainOverride, ForkConfig } from "@nomicfoundation/edr";
import { MineOrdering } from "@nomicfoundation/edr";
export declare function hardhatHardforkToEdrSpecId(hardfork: string, chainType: ChainType): string;
export declare function hardhatMiningIntervalToEdrMiningInterval(config: EdrNetworkMiningConfig["interval"]): bigint | IntervalRange | undefined;
export declare function hardhatMempoolOrderToEdrMineOrdering(mempoolOrder: EdrNetworkMempoolConfig["order"]): MineOrdering;
export declare function edrRpcDebugTraceToHardhat(debugTraceResult: DebugTraceResult): RpcDebugTraceOutput;
export declare function hardhatAccountsToEdrOwnedAccounts(accounts: EdrNetworkAccountsConfig): Promise<Array<{
    secretKey: string;
    balance: bigint;
}>>;
export declare function normalizeEdrNetworkAccountsConfig(accounts: EdrNetworkAccountsConfig): Promise<EdrNetworkAccountConfig[]>;
export declare function hardhatChainDescriptorsToEdrChainOverrides(chainDescriptors: ChainDescriptorsConfig, chainType: ChainType): ChainOverride[];
export declare function hardhatForkingConfigToEdrForkConfig(forkingConfig: EdrNetworkForkingConfig | undefined, chainDescriptors: ChainDescriptorsConfig, chainType: ChainType): Promise<ForkConfig | undefined>;
//# sourceMappingURL=convert-to-edr.d.ts.map