import { resolveFromRoot } from "@nomicfoundation/hardhat-utils/path";
import { throwIfSolidityBuildFailed } from "../build-results.js";
import { isNpmRootPath } from "../build-system/root-paths-utils.js";
const buildAction = async ({ force, files, quiet, defaultBuildProfile }, { solidity, globalOptions }) => {
    const rootPaths = files.length === 0
        ? await solidity.getRootFilePaths()
        : files.map((file) => {
            if (isNpmRootPath(file)) {
                return file;
            }
            return resolveFromRoot(process.cwd(), file);
        });
    const buildProfile = globalOptions.buildProfile ?? defaultBuildProfile;
    const results = await solidity.build(rootPaths, {
        force,
        buildProfile,
        quiet,
    });
    throwIfSolidityBuildFailed(results);
    // If we recompiled the entire project we cleanup the artifacts
    if (files.length === 0) {
        await solidity.cleanupArtifacts(rootPaths);
    }
};
export default buildAction;
//# sourceMappingURL=build.js.map