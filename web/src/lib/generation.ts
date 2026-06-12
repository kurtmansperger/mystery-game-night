import type { MysteryEvent } from "./types";
import { runPipeline } from "./agents/orchestrator";

// Generation dispatch (docs/02 §1, docs/07 stage 3). With Cloud Tasks
// configured, generation runs in the dedicated worker service behind the
// queue (retries, long timeout, no request-path coupling). Without it,
// it runs in-process — local dev and single-service demos.

function tasksConfigured(): boolean {
  return Boolean(
    process.env.TASKS_QUEUE &&
      process.env.TASKS_LOCATION &&
      process.env.WORKER_URL &&
      (process.env.GOOGLE_CLOUD_PROJECT || process.env.FIRESTORE_PROJECT_ID)
  );
}

export async function startGeneration(event: MysteryEvent): Promise<void> {
  if (!tasksConfigured()) {
    void runPipeline(event);
    return;
  }

  const { CloudTasksClient } = await import("@google-cloud/tasks");
  const g = globalThis as unknown as { __mgnTasks?: InstanceType<typeof CloudTasksClient> };
  const client = (g.__mgnTasks ??= new CloudTasksClient());

  const project = (process.env.GOOGLE_CLOUD_PROJECT || process.env.FIRESTORE_PROJECT_ID)!;
  const workerUrl = process.env.WORKER_URL!;
  const parent = client.queuePath(project, process.env.TASKS_LOCATION!, process.env.TASKS_QUEUE!);

  await client.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: "POST",
        url: `${workerUrl}/api/internal/generate`,
        headers: { "Content-Type": "application/json" },
        body: Buffer.from(JSON.stringify({ eventId: event.id })).toString("base64"),
        ...(process.env.TASKS_SA_EMAIL
          ? { oidcToken: { serviceAccountEmail: process.env.TASKS_SA_EMAIL, audience: workerUrl } }
          : {}),
      },
      // The pipeline is checkpoint-resumable; give one attempt half an hour.
      dispatchDeadline: { seconds: 1800 },
    },
  });
}
