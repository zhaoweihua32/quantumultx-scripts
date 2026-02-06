/**************************************
 * Streaming Unlock Check (Quantumult X)
 * Compatible with QX 598+
 **************************************/

const timeout = 3000;
const policy = $environment.params;

// ====== 基础工具 ======
function qxFetch(options) {
  return $task.fetch({
    ...options,
    policy,
    timeout,
  });
}

function done(title, content) {
  $done({
    title,
    content,
    icon: "checkmark.seal.system",
    "icon-color": "#2ecc71",
  });
}

// ====== 检测逻辑 ======
async function checkNetflix() {
  try {
    const resp = await qxFetch({
      url: "https://www.netflix.com/title/81215567",
    });
    return resp.status === 200 ? "✅ Netflix 可用" : "⚠️ Netflix 受限";
  } catch {
    return "❌ Netflix 失败";
  }
}

async function checkYouTube() {
  try {
    const resp = await qxFetch({
      url: "https://www.youtube.com/premium",
    });
    return resp.status === 200 ? "✅ YouTube Premium 可用" : "⚠️ YouTube 受限";
  } catch {
    return "❌ YouTube 失败";
  }
}

async function checkDisney() {
  try {
    const resp = await qxFetch({
      url: "https://www.disneyplus.com/",
    });
    return resp.status === 200 ? "✅ Disney+ 可用" : "⚠️ Disney+ 受限";
  } catch {
    return "❌ Disney+ 失败";
  }
}

async function checkChatGPT() {
  try {
    const resp = await qxFetch({
      url: "https://chat.openai.com/cdn-cgi/trace",
    });
    const region = resp.body.match(/loc=([A-Z]{2})/)?.[1];
    if (!region) return "⚠️ ChatGPT 未知区域";
    return `✅ ChatGPT 可用（${region}）`;
  } catch {
    return "❌ ChatGPT 失败";
  }
}

// ====== 主入口 ======
(async () => {
  const results = await Promise.all([
    checkNetflix(),
    checkYouTube(),
    checkDisney(),
    checkChatGPT(),
  ]);

  done("📺 流媒体解锁检测", results.join("\n"));
})();
