import { opGenesisState, opLatestHardfork, l1GenesisState, l1HardforkLatest, IncludeTraces, FsAccessPermission, } from "@nomicfoundation/edr";
import { hexStringToBytes } from "@nomicfoundation/hardhat-utils/hex";
import { OPTIMISM_CHAIN_TYPE } from "../../constants.js";
function hexStringToBuffer(hexString) {
    return Buffer.from(hexStringToBytes(hexString));
}
export function solidityTestConfigToRunOptions(config) {
    return config;
}
export function solidityTestConfigToSolidityTestRunnerConfigArgs(chainType, projectRoot, config, verbosity, observability, testPattern) {
    const fsPermissions = [
        config.fsPermissions?.readWriteFile?.map((p) => ({
            access: FsAccessPermission.ReadWriteFile,
            path: p,
        })) ?? [],
        config.fsPermissions?.readFile?.map((p) => ({
            access: FsAccessPermission.ReadFile,
            path: p,
        })) ?? [],
        config.fsPermissions?.writeFile?.map((p) => ({
            access: FsAccessPermission.WriteFile,
            path: p,
        })) ?? [],
        config.fsPermissions?.dangerouslyReadWriteDirectory?.map((p) => ({
            access: FsAccessPermission.DangerouslyReadWriteDirectory,
            path: p,
        })) ?? [],
        config.fsPermissions?.readDirectory?.map((p) => ({
            access: FsAccessPermission.ReadDirectory,
            path: p,
        })) ?? [],
        config.fsPermissions?.dangerouslyWriteDirectory?.map((p) => ({
            access: FsAccessPermission.DangerouslyWriteDirectory,
            path: p,
        })) ?? [],
    ].flat(1);
    const sender = config.from === undefined ? undefined : hexStringToBuffer(config.from);
    const txOrigin = config.txOrigin === undefined
        ? undefined
        : hexStringToBuffer(config.txOrigin);
    const blockCoinbase = config.coinbase === undefined
        ? undefined
        : hexStringToBuffer(config.coinbase);
    const localPredeploys = chainType === OPTIMISM_CHAIN_TYPE
        ? opGenesisState(opLatestHardfork())
        : l1GenesisState(l1HardforkLatest());
    let includeTraces = IncludeTraces.None;
    if (verbosity >= 5) {
        includeTraces = IncludeTraces.All;
    }
    else if (verbosity >= 3) {
        includeTraces = IncludeTraces.Failing;
    }
    const blockGasLimit = config.blockGasLimit === false ? undefined : config.blockGasLimit;
    const disableBlockGasLimit = config.blockGasLimit === false;
    const blockDifficulty = config.prevRandao;
    const ethRpcUrl = config.forking?.url;
    const forkBlockNumber = config.forking?.blockNumber;
    const rpcEndpoints = config.forking?.rpcEndpoints;
    return {
        projectRoot,
        ...config,
        fsPermissions,
        localPredeploys,
        sender,
        txOrigin,
        blockCoinbase,
        observability,
        testPattern,
        includeTraces,
        blockGasLimit,
        disableBlockGasLimit,
        blockDifficulty,
        ethRpcUrl,
        forkBlockNumber,
        rpcEndpoints,
    };
}
export function isTestSuiteArtifact(artifact) {
    const abi = JSON.parse(artifact.contract.abi);
    return abi.some(({ type, name }) => {
        if (type === "function" && typeof name === "string") {
            return name.startsWith("test") || name.startsWith("invariant");
        }
        return false;
    });
}
//# sourceMappingURL=helpers.js.map