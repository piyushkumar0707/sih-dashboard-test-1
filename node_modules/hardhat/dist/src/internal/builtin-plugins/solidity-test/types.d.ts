import type { SuiteResult } from "@nomicfoundation/edr";
import type { Readable } from "node:stream";
export type TestStatus = "Success" | "Failure" | "Skipped";
export type TestsStream = Readable;
export interface TestEvent {
    type: "suite:result";
    data: SuiteResult;
}
export type TestEventSource = AsyncGenerator<TestEvent, void>;
export type TestReporterResult = AsyncGenerator<string, void>;
export type TestReporter = (source: TestEventSource) => TestReporterResult;
//# sourceMappingURL=types.d.ts.map