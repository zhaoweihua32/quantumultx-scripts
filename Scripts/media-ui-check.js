/*********************************
 * Streaming Unlock Checker
 * For Quantumult X v1.8.x
 * event-interaction only
 *********************************/

const policy = $environment.params;
const timeout = 3000;
let output = [];

/* ========= 通用请求 ========= */
function req(url, cb) {
  $task.fetch({
    url: url,
    policy: policy,
    timeout: timeout
  }).then(
    r => cb(null, r),
    e => cb(e, null)
  );
}

/* ========= Netflix ========= */
function netflix(next) {
  req("https://www.netflix.com/title/81215567", (e, r) => {
    if (e || !r) {
      output.push("❌ Netflix：连接失败");
    } else if (r.status === 200) {
      output.push("✅ Netflix：可解锁");
    } else if (r.status === 403) {
      output.push("🚫 Netflix：被限制");
    } else {
      output.push("⚠️ Netflix：未知状态");
    }
    next();
  });
}

/* ========= YouTube ========= */
function youtube(next) {
  req("https://www.youtube.com/premium", (e, r) => {
    if (e || !r) {
      output.push("❌ YouTube：连接失败");
    } else if (r.status === 200) {
      output.push("✅ YouTube Premium：可用");
    } else {
      output.push("🚫 YouTube Premium：不可用");
    }
    next();
  });
}

/* ========= ChatGPT ========= */
function chatgpt(next) {
  req("https://chat.openai.com/cdn-cgi/trace", (e, r) => {
    if (e || !r || !r.body) {
      output.push("❌ ChatGPT：连接失败");
    } else {
      const m = r.body.match(/loc=([A-Z]{2})/);
      output.push(
        m
          ? "✅ ChatGPT：可用（" + m[1] + "）"
          : "⚠️ ChatGPT：地区未知"
      );
    }
    next();
  });
}

/* ========= 串行执行（老版最稳） ========= */
netflix(() => {
  youtube(() => {
    chatgpt(() => {
      $done({
        title: "📺 流媒体检测",
        content: output.join("\n")
      });
    });
  });
});
