export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { image, mediaType } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
          { type: "text", text: "이 리니지 게임 스크린샷에서 캐릭터 닉네임만 추출해줘. 캐릭터 위에 표시된 한글/영문 닉네임만, 쉼표로 구분해서 나열해줘. 다른 설명 없이 닉네임만." }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.content?.find(c => c.type === "text")?.text || "";
  res.status(200).json({ text });
}
