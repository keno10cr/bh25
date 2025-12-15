import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { activityName, activityId, language, timestamp } = await request.json();

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Log file path
    const logFile = path.join(logsDir, "activity-clicks.jsonl");

    // Create log entry
    const logEntry = {
      activityName,
      activityId,
      language,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Append to log file (JSONL format - one JSON object per line)
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking activity click:", error);
    return NextResponse.json({ error: "Failed to track activity" }, { status: 500 });
  }
}





