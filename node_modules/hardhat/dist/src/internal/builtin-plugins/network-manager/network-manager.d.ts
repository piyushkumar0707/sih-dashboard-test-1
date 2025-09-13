import type { ArtifactManager } from "../../../types/artifacts.js";
import type { ChainDescriptorsConfig, NetworkConfig, NetworkUserConfig } from "../../../types/config.js";
import type { HookManager } from "../../../types/hooks.js";
import type { ChainType, DefaultChainType, NetworkConnection, NetworkConnectionParams, NetworkManager } from "../../../types/network.js";
import type { JsonRpcRequest, JsonRpcResponse } from "../../../types/providers.js";
export type JsonRpcRequestWrapperFunction = (request: JsonRpcRequest, defaultBehavior: (r: JsonRpcRequest) => Promise<JsonRpcResponse>) => Promise<JsonRpcResponse>;
export declare class NetworkManagerImplementation implements NetworkManager {
    #private;
    constructor(defaultNetwork: string, defaultChainType: DefaultChainType, networkConfigs: Record<string, NetworkConfig>, hookManager: HookManager, artifactsManager: ArtifactManager, userConfigNetworks: Record<string, NetworkUserConfig> | undefined, chainDescriptors: ChainDescriptorsConfig);
    connect<ChainTypeT extends ChainType | string = DefaultChainType>(networkOrParams?: NetworkConnectionParams<ChainTypeT> | string): Promise<NetworkConnection<ChainTypeT>>;
}
//# sourceMappingURL=network-manager.d.ts.map