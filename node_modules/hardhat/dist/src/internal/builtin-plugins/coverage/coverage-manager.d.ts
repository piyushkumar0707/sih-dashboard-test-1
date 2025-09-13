import type { CoverageData, CoverageManager, CoverageMetadata, Tag } from "./types.js";
type Line = number;
type Branch = [Line, Tag];
export interface Report {
    [relativePath: string]: {
        tagExecutionCounts: Map<Tag, number>;
        lineExecutionCounts: Map<Line, number>;
        branchExecutionCounts: Map<Branch, number>;
        executedTagsCount: number;
        executedLinesCount: number;
        executedBranchesCount: number;
        partiallyExecutedLines: Set<Line>;
        unexecutedLines: Set<Line>;
    };
}
export declare class CoverageManagerImplementation implements CoverageManager {
    #private;
    metadata: CoverageMetadata;
    data: CoverageData;
    constructor(coveragePath: string);
    addData(data: CoverageData): Promise<void>;
    addMetadata(metadata: CoverageMetadata): Promise<void>;
    clearData(id: string): Promise<void>;
    saveData(id: string): Promise<void>;
    report(...ids: string[]): Promise<void>;
    enableReport(): void;
    disableReport(): void;
    loadData(...ids: string[]): Promise<void>;
    getReport(): Report;
    formatLcovReport(report: Report): string;
    formatRelativePath(relativePath: string): string;
    formatCoverage(coverage: number): string;
    formatLines(lines: Set<number>): string;
    formatMarkdownReport(report: Report): string;
}
export {};
//# sourceMappingURL=coverage-manager.d.ts.map