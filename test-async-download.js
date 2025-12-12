// Test script to demonstrate async download pattern
const BASE_URL = "http://localhost:3000";

async function testAsyncDownload(fileId) {
  console.log(`\n🚀 Testing async download for file_id: ${fileId}`);

  try {
    // 1. Start download job (returns immediately)
    console.log("📤 Starting download job...");
    const startResponse = await fetch(`${BASE_URL}/v1/download/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    });

    const startResult = await startResponse.json();
    console.log("✅ Job started:", startResult);

    const jobId = startResult.jobId;

    // 2. Poll for status until completion
    console.log("⏳ Polling for completion...");
    let status = "queued";
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (
      status !== "completed" &&
      status !== "failed" &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      const statusResponse = await fetch(
        `${BASE_URL}/v1/download/status/${jobId}`,
      );
      const statusResult = await statusResponse.json();

      status = statusResult.status;
      console.log(`📊 Status check ${attempts}: ${status}`);

      if (status === "completed") {
        console.log("🎉 Download completed!");
        console.log("📁 Result:", statusResult.result);
        console.log(`⏱️  Total time: ${statusResult.processingTimeMs}ms`);
        break;
      } else if (status === "failed") {
        console.log("❌ Download failed:", statusResult.error);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.log("⏰ Timeout: Job took too long");
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
  }
}

// Test with different file IDs
async function runTests() {
  console.log("🧪 Testing Async Download Pattern");
  console.log("==================================");

  // Test multiple downloads simultaneously
  const fileIds = [70000, 80000, 90000];

  console.log("🔄 Starting multiple downloads simultaneously...");
  const promises = fileIds.map((id) => testAsyncDownload(id));

  await Promise.all(promises);

  console.log("\n✨ All tests completed!");
}

runTests().catch(console.error);
