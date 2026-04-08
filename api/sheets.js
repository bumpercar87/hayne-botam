const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTZgjljUvoG6D6zQMezpPnuL8alfMab74x_5pzACvBxfwR8FA0CgE-suK1Um-gb1NZ/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const params = req.method === "POST" ? req.body : req.query;
    const url = APPS_SCRIPT_URL + "?" + new URLSearchParams(params);
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();
    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
