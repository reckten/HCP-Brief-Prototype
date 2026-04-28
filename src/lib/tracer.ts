import { StageTrace, StageTraceSchema } from "./schema.js";
import { writeJson } from "./fs.js";
import path from "path";

export class Tracer {
  private traces: StageTrace[] = [];
  private runDir: string;

  constructor(runDir: string) {
    this.runDir = runDir;
  }

  startStage(
    runId: string,
    stage: string
  ): {
    started_at: string;
    finish: (status: StageTrace["status"], summary: string, retries?: number) => StageTrace;
  } {
    const started_at = new Date().toISOString();
    const finish = (
      status: StageTrace["status"],
      summary: string,
      retries = 0
    ): StageTrace => {
      const ended_at = new Date().toISOString();
      const trace: StageTrace = {
        run_id: runId,
        stage,
        status,
        started_at,
        ended_at,
        duration_ms: Date.now() - new Date(started_at).getTime(),
        retry_count: retries,
        output_summary: summary,
      };
      StageTraceSchema.parse(trace);
      this.traces.push(trace);
      return trace;
    };
    return { started_at, finish };
  }

  async flush(): Promise<void> {
    await writeJson(path.join(this.runDir, "trace.json"), this.traces);
  }

  getTraces(): StageTrace[] {
    return [...this.traces];
  }
}
