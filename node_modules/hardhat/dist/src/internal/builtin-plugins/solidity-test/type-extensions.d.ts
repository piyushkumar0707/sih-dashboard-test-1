import "../../../types/config.js";
declare module "../../../types/config.js" {
    interface TestPathsUserConfig {
        solidity?: string;
    }
    interface TestPathsConfig {
        solidity: string;
    }
}
declare module "../../../types/test.js" {
    interface SolidityTestUserConfig {
        timeout?: number;
        fsPermissions?: {
            readWriteFile?: string[];
            readFile?: string[];
            writeFile?: string[];
            dangerouslyReadWriteDirectory?: string[];
            readDirectory?: string[];
            dangerouslyWriteDirectory?: string[];
        };
        isolate?: boolean;
        ffi?: boolean;
        allowInternalExpectRevert?: boolean;
        from?: string;
        txOrigin?: string;
        initialBalance?: bigint;
        blockBaseFeePerGas?: bigint;
        coinbase?: string;
        blockTimestamp?: bigint;
        prevRandao?: bigint;
        blockGasLimit?: bigint | false;
        forking?: {
            url?: string;
            blockNumber?: bigint;
            rpcEndpoints?: Record<string, string>;
        };
        fuzz?: {
            failurePersistDir?: string;
            failurePersistFile?: string;
            runs?: number;
            maxTestRejects?: number;
            seed?: string;
            dictionaryWeight?: number;
            includeStorage?: boolean;
            includePushBytes?: boolean;
        };
        invariant?: {
            failurePersistDir?: string;
            runs?: number;
            depth?: number;
            failOnRevert?: boolean;
            callOverride?: boolean;
            dictionaryWeight?: number;
            includeStorage?: boolean;
            includePushBytes?: boolean;
            shrinkRunLimit?: number;
        };
    }
    interface HardhatTestUserConfig {
        solidity?: SolidityTestUserConfig;
    }
    interface SolidityTestConfig extends SolidityTestUserConfig {
    }
    interface HardhatTestConfig {
        solidity: SolidityTestConfig;
    }
}
//# sourceMappingURL=type-extensions.d.ts.map