class LazySolidityBuildSystem {
    #hooks;
    #options;
    #buildSystem;
    constructor(hooks, options) {
        this.#hooks = hooks;
        this.#options = options;
    }
    async getRootFilePaths() {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.getRootFilePaths();
    }
    async build(rootFiles, options) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.build(rootFiles, options);
    }
    async getCompilationJobs(rootFiles, options) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.getCompilationJobs(rootFiles, options);
    }
    async runCompilationJob(compilationJob, options) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.runCompilationJob(compilationJob, options);
    }
    async remapCompilerError(compilationJob, error, shouldShortenPaths) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.remapCompilerError(compilationJob, error, shouldShortenPaths);
    }
    async emitArtifacts(compilationJob, compilerOutput) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.emitArtifacts(compilationJob, compilerOutput);
    }
    async cleanupArtifacts(rootFilePaths) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.cleanupArtifacts(rootFilePaths);
    }
    async compileBuildInfo(buildInfo, options) {
        const buildSystem = await this.#getBuildSystem();
        return buildSystem.compileBuildInfo(buildInfo, options);
    }
    async #getBuildSystem() {
        const { SolidityBuildSystemImplementation } = await import("../build-system/build-system.js");
        if (this.#buildSystem === undefined) {
            this.#buildSystem = new SolidityBuildSystemImplementation(this.#hooks, this.#options);
        }
        return this.#buildSystem;
    }
}
export default async () => {
    return {
        created: async (_context, hre) => {
            hre.solidity = new LazySolidityBuildSystem(hre.hooks, {
                solidityConfig: hre.config.solidity,
                projectRoot: hre.config.paths.root,
                soliditySourcesPaths: hre.config.paths.sources.solidity,
                artifactsPath: hre.config.paths.artifacts,
                cachePath: hre.config.paths.cache,
                solidityTestsPath: hre.config.paths.tests.solidity,
            });
        },
    };
};
//# sourceMappingURL=hre.js.map