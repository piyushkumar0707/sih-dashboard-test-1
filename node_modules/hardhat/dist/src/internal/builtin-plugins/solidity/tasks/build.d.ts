import type { NewTaskActionFunction } from "../../../../types/tasks.js";
interface CompileActionArguments {
    force: boolean;
    files: string[];
    quiet: boolean;
    defaultBuildProfile: string | undefined;
}
declare const buildAction: NewTaskActionFunction<CompileActionArguments>;
export default buildAction;
//# sourceMappingURL=build.d.ts.map