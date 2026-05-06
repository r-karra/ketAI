import http from "http";

http.get("http://0.0.0.0:3000/api/projects", (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("HEADERS:", res.headers);
    console.log("BODY:", data.substring(0, 200));
  });
}).on("error", (err) => {
  console.error("ERROR:", err.message);
});
