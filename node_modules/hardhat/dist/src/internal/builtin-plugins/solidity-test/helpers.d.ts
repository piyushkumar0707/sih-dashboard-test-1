import type { RunOptions } from "./runner.js";
import type { ChainType } from "../../../types/network.js";
import type { SolidityTestConfig } from "../../../types/test.js";
import type { SolidityTestRunnerConfigArgs, Artifact, ObservabilityConfig } from "@nomicfoundation/edr";
export declare function solidityTestConfigToRunOptions(config: SolidityTestConfig): RunOptions;
export declare function solidityTestConfigToSolidityTestRunnerConfigArgs(chainType: ChainType, projectRoot: string, config: SolidityTestConfig, verbosity: number, observability?: ObservabilityConfig, testPattern?: string): SolidityTestRunnerConfigArgs;
export declare function isTestSuiteArtifact(artifact: Artifact): boolean;
//# sourceMappingURL=helpers.d.ts.map