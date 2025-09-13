import type { SolidityConfig } from "../../../../types/config.js";
import type { HookManager } from "../../../../types/hooks.js";
import type { SolidityBuildSystem, BuildOptions, CompilationJobCreationError, FileBuildResult, GetCompilationJobsOptions, CompileBuildInfoOptions, RunCompilationJobOptions, GetCompilationJobsResult, EmitArtifactsResult, RunCompilationJobResult } from "../../../../types/solidity/build-system.js";
import type { CompilationJob } from "../../../../types/solidity/compilation-job.js";
import type { CompilerOutput, CompilerOutputError } from "../../../../types/solidity/compiler-io.js";
import type { SolidityBuildInfo } from "../../../../types/solidity.js";
export interface SolidityBuildSystemOptions {
    readonly solidityConfig: SolidityConfig;
    readonly projectRoot: string;
    readonly soliditySourcesPaths: string[];
    readonly artifactsPath: string;
    readonly cachePath: string;
    readonly solidityTestsPath: string;
}
export declare class SolidityBuildSystemImplementation implements SolidityBuildSystem {
    #private;
    constructor(hooks: HookManager, options: SolidityBuildSystemOptions);
    getRootFilePaths(): Promise<string[]>;
    build(rootFilePaths: string[], options?: BuildOptions): Promise<CompilationJobCreationError | Map<string, FileBuildResult>>;
    getCompilationJobs(rootFilePaths: string[], options?: GetCompilationJobsOptions): Promise<CompilationJobCreationError | GetCompilationJobsResult>;
    runCompilationJob(runnableCompilationJob: CompilationJob, options?: RunCompilationJobOptions): Promise<RunCompilationJobResult>;
    remapCompilerError(runnableCompilationJob: CompilationJob, error: CompilerOutputError, shouldShortenPaths?: boolean): Promise<CompilerOutputError>;
    emitArtifacts(runnableCompilationJob: CompilationJob, compilerOutput: CompilerOutput): Promise<EmitArtifactsResult>;
    cleanupArtifacts(rootFilePaths: string[]): Promise<void>;
    compileBuildInfo(_buildInfo: SolidityBuildInfo, _options?: CompileBuildInfoOptions): Promise<CompilerOutput>;
}
//# sourceMappingURL=build-system.d.ts.map