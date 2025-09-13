import type { UnsafeHardhatRuntimeEnvironmentOptions } from "./types.js";
import type { ArtifactManager } from "../../types/artifacts.js";
import type { HardhatUserConfig, HardhatConfig } from "../../types/config.js";
import type { GlobalOptions } from "../../types/global-options.js";
import type { HookManager } from "../../types/hooks.js";
import type { HardhatRuntimeEnvironment } from "../../types/hre.js";
import type { NetworkManager } from "../../types/network.js";
import type { SolidityBuildSystem } from "../../types/solidity/build-system.js";
import type { TaskManager } from "../../types/tasks.js";
import type { UserInterruptionManager } from "../../types/user-interruptions.js";
import type { CoverageManager } from "../builtin-plugins/coverage/types.js";
export declare class HardhatRuntimeEnvironmentImplementation implements HardhatRuntimeEnvironment {
    readonly userConfig: HardhatUserConfig;
    readonly config: HardhatConfig;
    readonly hooks: HookManager;
    readonly interruptions: UserInterruptionManager;
    readonly globalOptions: GlobalOptions;
    network: NetworkManager;
    artifacts: ArtifactManager;
    solidity: SolidityBuildSystem;
    _coverage: CoverageManager;
    static create(inputUserConfig: HardhatUserConfig, userProvidedGlobalOptions: Partial<GlobalOptions>, projectRoot?: string, unsafeOptions?: UnsafeHardhatRuntimeEnvironmentOptions): Promise<HardhatRuntimeEnvironmentImplementation>;
    readonly tasks: TaskManager;
    private constructor();
}
/**
 * Resolves the project root of a Hardhat project based on the config file or
 * another path within the project. If not provided, it will be resolved from
 * the current working directory.
 *
 * @param absolutePathWithinProject An absolute path within the project, usually
 * the config file.
 */
export declare function resolveProjectRoot(absolutePathWithinProject: string | undefined): Promise<string>;
//# sourceMappingURL=hre.d.ts.map