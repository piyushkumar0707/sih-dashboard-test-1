import type { HardhatUserConfig } from "../../../config.js";
import type { HardhatConfig } from "../../../types/config.js";
import type { HardhatUserConfigValidationError } from "../../../types/hooks.js";
export declare function validateSolidityTestUserConfig(userConfig: unknown): HardhatUserConfigValidationError[];
export declare function resolveSolidityTestUserConfig(userConfig: HardhatUserConfig, resolvedConfig: HardhatConfig): Promise<HardhatConfig>;
//# sourceMappingURL=config.d.ts.map