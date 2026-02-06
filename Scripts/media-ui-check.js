/*****************************************
 * Streaming Unlock Check
 * Quantumult X v1.8.6 Compatible
 * event-interaction ONLY
 *****************************************/

const policy = $environment.params;
const timeout = 3000;

let result = [];

// ====== 工具函数 ======
function fetch(url, callback) {
  $task.fetch({
    url: url,
    policy: policy,
    timeout: timeout
  }).then(
    resp => callback(null, resp),
    err => callback(err, null)
  );
}

// ====== Netflix ======
function checkNetflix(next) {
  fetch("https://www.netflix.com/title/81215567", (err, resp) => {
    if (err || !resp) {
      result.push("❌ Netflix 连接失败");
    } else if (resp.status === 200) {
      result.push("✅ Netflix 可用");
    } else {
      result.push("⚠️ Netflix 受限");
    }
    next();
  });
}

// ====== YouTube ======
function checkYouTube(next) {
  fetch("https://www.youtube.com/premium", (err, resp) => {
    if (err || !resp) {
      result.push("❌ YouTube 连接失败");
    } else if (resp.status === 200) {
      result.push("✅ YouTube Premium 可用");
    } else {
      result.push("⚠️ YouTube 受限");
    }
    next();
  });
}

// ====== ChatGPT ======
function checkChatGPT(next) {
  fetch("https://chat.openai.com/cdn-cgi/trace", (err, resp) => {
    if (err || !resp || !resp.body) {
      result.push("❌ ChatGPT 连接失败");
    } else {
      const m = resp.body.match(/loc=([A-Z]{2})/);
      if (m) {
        result.push("✅ ChatGPT 可用（" + m[1] + "）");
      } else {
        result.push("⚠️ ChatGPT 区域未知");
      }
    }
    next();
  });
}

// ====== 执行链（串行，老版最稳） ======
checkNetflix(() => {
  checkYouTube(() => {
    checkChatGPT(() => {
      $done({
        title: "📺 流媒体解锁检测",
        content: result.join("\n")
      });
    });
  });
});
