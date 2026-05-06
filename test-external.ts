async function run() {
  const url = "https://ais-dev-5qrqdcwqgrbqf7hoxziwok-47851105980.asia-east1.run.app/api/projects";
  console.log("Fetching", url);
  try {
    const res = await fetch(url);
    console.log("STATUS:", res.status);
    console.log("HEADERS:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("BODY:", text.substring(0, 300));
  } catch(e) {
    console.error("Fetch Error:", e.message);
  }
}
run();
