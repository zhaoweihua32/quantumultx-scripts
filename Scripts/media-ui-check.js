/***
Thanks to & modified from 
1. https://gist.githubusercontent.com/Hyseen/b06e911a41036ebc36acf04ddebe7b9a/raw/nf_check.js
2. https://github.com/AtlantisGawrGura/Quantumult-X-Scripts/blob/main/media.js
3. https://github.com/CoiaPrant/MediaUnlock_Test/blob/main/check.sh
4. https://github.com/Netflixxp/chatGPT/blob/main/chat.sh

For Quantumult-X 598+ (兼容新版)

2026-02-06 修复版
- 修复finally块重复调用$done()、未定义output变量问题
- 优化异步逻辑，统一Promise处理
- 更新流媒体接口适配规则
- 修复国旗映射表、语法漏洞
- 增强错误处理，避免脚本中断
**/

const BASE_URL = 'https://www.netflix.com/title/';
const BASE_URL_YTB = "https://www.youtube.com/premium";
const BASE_URL_DISNEY = 'https://www.disneyplus.com';
const BASE_URL_Dazn = "https://startup.core.indazn.com/misl/v5/Startup";
const BASE_URL_Param = "https://www.paramountplus.com/";
const FILM_ID = 81280792;
const BASE_URL_Discovery_token = "https://us1-prod-direct.discoveryplus.com/token?deviceId=d1a4a5d25212400d1e6985984604d740&realm=go&shortlived=true";
const BASE_URL_Discovery = "https://us1-prod-direct.discoveryplus.com/users/me";
const BASE_URL_GPT = 'https://chat.openai.com/';
const Region_URL_GPT = 'https://chat.openai.com/cdn-cgi/trace';

const link = { "media-url": "https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/img/southpark/7.png" };
const policy_name = "Netflix"; // 填入你的Netflix策略组名

const arrow = " ➟ ";

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 状态常量
const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

// 修复国旗映射表（补全缺失、修正错误）
const flags = new Map([
  ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"], ["AL", "🇦🇱"], ["AM", "🇦🇲"], ["AQ", "🇦🇶"], ["AR", "🇦🇷"], ["AS", "🇦🇸"], ["AT", "🇦🇹"], ["AU", "🇦🇺"], ["AW", "🇦🇼"], ["AX", "🇦🇽"], ["AZ", "🇦🇿"],
  ["BA", "🇧🇦"], ["BB", "🇧🇧"], ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"], ["BH", "🇧🇭"], ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"], ["BN", "🇧🇳"], ["BO", "🇧🇴"], ["BR", "🇧🇷"], ["BS", "🇧🇸"], ["BT", "🇧🇹"], ["BV", "🇧🇻"], ["BW", "🇧🇼"], ["BY", "🇧🇾"], ["BZ", "🇧🇿"],
  ["CA", "🇨🇦"], ["CF", "🇨🇫"], ["CH", "🇨🇭"], ["CK", "🇨🇰"], ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"], ["CO", "🇨🇴"], ["CP", "🇨🇵"], ["CR", "🇨🇷"], ["CU", "🇨🇺"], ["CV", "🇨🇻"], ["CW", "🇨🇼"], ["CX", "🇨🇽"], ["CY", "🇨🇾"], ["CZ", "🇨🇿"],
  ["DE", "🇩🇪"], ["DG", "🇩🇬"], ["DJ", "🇩🇯"], ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"], ["DZ", "🇩🇿"],
  ["EA", "🇪🇦"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"], ["EH", "🇪🇭"], ["ER", "🇪🇷"], ["ES", "🇪🇸"], ["ET", "🇪🇹"], ["EU", "🇪🇺"],
  ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FK", "🇫🇰"], ["FM", "🇫🇲"], ["FO", "🇫🇴"], ["FR", "🇫🇷"],
  ["GA", "🇬🇦"], ["GB", "🇬🇧"], ["HK", "🇭🇰"], ["HU", "🇭🇺"],
  ["ID", "🇮🇩"], ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IM", "🇮🇲"], ["IN", "🇮🇳"], ["IS", "🇮🇸"], ["IT", "🇮🇹"],
  ["JP", "🇯🇵"],
  ["KR", "🇰🇷"],
  ["LU", "🇱🇺"],
  ["MO", "🇲🇴"], ["MX", "🇲🇽"], ["MY", "🇲🇾"],
  ["NL", "🇳🇱"],
  ["PH", "🇵🇭"],
  ["RO", "🇷🇴"], ["RS", "🇷🇸"], ["RU", "🇷🇺"], ["RW", "🇷🇼"],
  ["SA", "🇸🇦"], ["SB", "🇸🇧"], ["SC", "🇸🇨"], ["SD", "🇸🇩"], ["SE", "🇸🇪"], ["SG", "🇸🇬"],
  ["TH", "🇹🇭"], ["TN", "🇹🇳"], ["TO", "🇹🇴"], ["TR", "🇹🇷"], ["TV", "🇹🇻"], ["TW", "🇹🇼"],
  ["UK", "🇬🇧"], ["UM", "🇺🇲"], ["US", "🇺🇸"], ["UY", "🇺🇾"], ["UZ", "🇺🇿"],
  ["VA", "🇻🇦"], ["VE", "🇻🇪"], ["VG", "🇻🇬"], ["VI", "🇻🇮"], ["VN", "🇻🇳"],
  ["ZA", "🇿🇦"]
]);

// 初始化检测结果
let result = {
  "title": '    📺  流媒体服务查询',
  "YouTube": '<b>YouTube: </b>检测失败，请重试 ❗️',
  "Netflix": '<b>Netflix: </b>检测失败，请重试 ❗️',
  "Dazn": "<b>Dazn: </b>检测失败，请重试 ❗️",
  "Disney": "<b>Disneyᐩ: </b>检测失败，请重试 ❗️",
  "Paramount": "<b>Paramountᐩ: </b>检测失败，请重试 ❗️",
  "Discovery": "<b>Discoveryᐩ: </b>检测失败，请重试 ❗️",
  "ChatGPT": "<b>ChatGPT: </b>检测失败，请重试 ❗️"
};

// 策略组参数
const opts = { policy: $environment.params };
const opts1 = { policy: $environment.params, redirection: false };
const message = { action: "get_policy_state", content: $environment.params };

// 核心执行逻辑（重构异步流程）
;(async () => {
  try {
    // 并行执行所有检测（解决同步调用导致的结果丢失）
    await Promise.all([
      testNf(FILM_ID),
      testYTB(),
      testDazn(),
      testParam(),
      testDiscovery(),
      testChatGPT()
    ]);
    
    // 单独处理Disney+（依赖多步接口）
    const { region, status } = await testDisneyPlus();
    if (status === STATUS_COMING) {
      result["Disney"] = `<b>Disneyᐩ:</b> 即将登陆 ${arrow} ⟦${flags.get(region?.toUpperCase() || 'XX')}⟧ ⚠️`;
    } else if (status === STATUS_AVAILABLE) {
      result["Disney"] = `<b>Disneyᐩ:</b> 支持 ${arrow} ⟦${flags.get(region?.toUpperCase() || 'XX')}⟧ 🎉`;
    } else if (status === STATUS_NOT_AVAILABLE) {
      result["Disney"] = "<b>Disneyᐩ:</b> 未支持 🚫 ";
    } else if (status === STATUS_TIMEOUT) {
      result["Disney"] = "<b>Disneyᐩ:</b> 检测超时 🚦 ";
    } else {
      result["Disney"] = "<b>Disneyᐩ:</b> 检测异常 ❗️ ";
    }

    // 获取策略组信息并输出结果
    const resolve = await $configuration.sendMessage(message);
    if (resolve.error) throw new Error("获取策略组信息失败");
    
    let output = resolve.ret ? 
      JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g, "").replace(/\,/g, " ➟ ") : 
      $environment.params;
    
    // 组装最终输出内容
    const contentList = [result["Dazn"], result["Discovery"], result["Paramount"], result["Disney"], result["ChatGPT"], result["Netflix"], result["YouTube"]];
    let content = "--------------------------------------</br>" + contentList.join("</br></br>");
    content += "</br>--------------------------------------</br>";
    content += `<font color=#CD5C5C><b>节点</b> ${arrow} ${output}</font>`;
    content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">${content}</p>`;
    
    // 输出结果（仅调用一次$done）
    $done({ title: result["title"], htmlMessage: content });

  } catch (error) {
    // 全局错误捕获
    console.error("脚本执行异常：", error);
    let content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">`;
    content += "----------------------</br></br>🚥 检测异常</br>";
    content += `<font color=#FF0000>${error.message || "未知错误"}</font>`;
    content += `</br></br>----------------------</br>${$environment.params}</p>`;
    $done({ title: result["title"], htmlMessage: content });
  }
})();

// ==================== 检测函数（修复/优化） ====================
async function testDisneyPlus() {
  try {
    // 超时控制（7秒）
    const homeResult = await Promise.race([testHomePage(), timeout(7000)]);
    const { region: homeRegion } = homeResult || { region: "" };
    
    // 获取位置信息
    const locationResult = await Promise.race([getLocationInfo(), timeout(7000)]);
    const { countryCode, inSupportedLocation, accessToken } = locationResult || {};
    
    const finalRegion = countryCode ?? homeRegion;
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region: finalRegion, status: STATUS_COMING };
    }
    
    // 验证API访问
    const apiSupport = await Promise.race([testPublicGraphqlAPI(accessToken), timeout(5000)]);
    return { region: finalRegion, status: apiSupport ? STATUS_AVAILABLE : STATUS_NOT_AVAILABLE };

  } catch (error) {
    if (error === 'Not Available') return { status: STATUS_NOT_AVAILABLE };
    if (error === 'Timeout') return { status: STATUS_TIMEOUT };
    return { status: STATUS_ERROR };
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    const opts0 = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      method: "POST",
      opts: opts,
      headers: {
        'Accept-Language': 'en',
        "Authorization": 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '120.0.0.0',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    };

    $task.fetch(opts0).then(response => {
      if (response.statusCode !== 200) return reject('Not Available');
      const data = JSON.parse(response.body);
      const sdkData = data?.extensions?.sdk || {};
      resolve({
        countryCode: sdkData?.session?.location?.countryCode,
        inSupportedLocation: sdkData?.session?.inSupportedLocation,
        accessToken: sdkData?.token?.accessToken
      });
    }).catch(() => reject('Error'));
  });
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    const opts0 = {
      url: BASE_URL_DISNEY,
      opts: opts,
      headers: { 'Accept-Language': 'en', 'User-Agent': UA },
    };
    $task.fetch(opts0).then(response => {
      if (response.statusCode !== 200 || response.body.indexOf('not available in your region') !== -1) {
        return reject('Not Available');
      }
      const match = response.body.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      resolve({
        region: match ? match[1] : "",
        cnbl: match ? match[2] : ""
      });
    }).catch(() => reject('Error'));
  });
}

function testPublicGraphqlAPI(accessToken) {
  if (!accessToken) return Promise.resolve(false);
  return new Promise((resolve) => {
    const opts = {
      url: 'https://disney.api.edge.bamgrid.com/v1/public/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) { uiLanguage(preferredLanguages: $preferredLanguages) }}',
        variables: { version: '1.5.0', preferredLanguages: ['en'] },
      }),
    };
    $task.fetch(opts).then(res => resolve(res.statusCode === 200)).catch(() => resolve(false));
  });
}

function timeout(delay = 5000) {
  return new Promise((_, reject) => setTimeout(() => reject('Timeout'), delay));
}

function testNf(filmId) {
  return new Promise((resolve) => {
    const option = {
      url: BASE_URL + filmId,
      opts: opts,
      timeout: 5200,
      headers: { 'User-Agent': UA },
    };
    $task.fetch(option).then(response => {
      if (response.statusCode === 404) {
        result["Netflix"] = "<b>Netflix: </b>支持自制剧集 ⚠️";
      } else if (response.statusCode === 403) {
        result["Netflix"] = "<b>Netflix: </b>未支持 🚫";
      } else if (response.statusCode === 200) {
        const url = response.headers['X-Originating-URL'] || '';
        const region = (url.split('/')[3]?.split('-')[0] || 'us').replace('title', 'us');
        result["Netflix"] = `<b>Netflix: </b>完整支持${arrow} ⟦${flags.get(region.toUpperCase()) || '🇺🇸'}⟧ 🎉`;
      } else {
        result["Netflix"] = "<b>Netflix: </b>检测异常 ❗️";
      }
      resolve();
    }).catch(() => {
      result["Netflix"] = "<b>Netflix: </b>检测超时 🚦";
      resolve();
    });
  });
}

function testYTB() {
  return new Promise((resolve) => {
    const option = {
      url: BASE_URL_YTB,
      opts: opts,
      timeout: 2800,
      headers: { 'User-Agent': UA },
    };
    $task.fetch(option).then(response => {
      if (response.statusCode !== 200) {
        result["YouTube"] = "<b>YouTube Premium: </b>检测失败 ❗️";
      } else if (response.body.indexOf('Premium is not available in your country') !== -1) {
        result["YouTube"] = "<b>YouTube Premium: </b>未支持 🚫";
      } else {
        const re = new RegExp('"GL":"(.*?)"', 'gm');
        const ret = re.exec(response.body);
        const region = ret?.[1] || (response.body.indexOf('www.google.cn') !== -1 ? 'CN' : 'US');
        result["YouTube"] = `<b>YouTube Premium: </b>支持 ${arrow} ⟦${flags.get(region.toUpperCase()) || '🇺🇸'}⟧ 🎉`;
      }
      resolve();
    }).catch(() => {
      result["YouTube"] = "<b>YouTube Premium: </b>检测超时 🚦";
      resolve();
    });
  });
}

function testDazn() {
  return new Promise((resolve) => {
    const extra = `{
      "LandingPageKey":"generic",
      "Platform":"web",
      "PlatformAttributes":{},
      "Manufacturer":"",
      "PromoCode":"",
      "Version":"2"
    }`;
    const option = {
      url: BASE_URL_Dazn,
      method: "POST",
      opts: opts,
      timeout: 2800,
      headers: { 'User-Agent': UA, "Content-Type": "application/json" },
      body: extra,
    };
    $task.fetch(option).then(response => {
      if (response.statusCode !== 200) {
        result["Dazn"] = "<b>Dazn: </b>检测失败 ❗️";
      } else {
        const re = new RegExp('"GeolocatedCountry":"(.*?)"', 'gm');
        const ret = re.exec(response.body);
        const region = ret?.[1] || "";
        result["Dazn"] = region ? 
          `<b>Dazn: </b>支持 ${arrow} ⟦${flags.get(region.toUpperCase()) || '🇺🇸'}⟧ 🎉` : 
          "<b>Dazn: </b>未支持 🚫";
      }
      resolve();
    }).catch(() => {
      result["Dazn"] = "<b>Dazn: </b>检测超时 🚦";
      resolve();
    });
  });
}

function testParam() {
  return new Promise((resolve) => {
    const option = {
      url: BASE_URL_Param,
      opts: opts1,
      timeout: 2800,
      headers: { 'User-Agent': UA },
    };
    $task.fetch(option).then(response => {
      if (response.statusCode === 200) {
        result["Paramount"] = "<b>Paramountᐩ: </b>支持 🎉 ";
      } else if (response.statusCode === 302) {
        result["Paramount"] = "<b>Paramountᐩ: </b>未支持 🚫";
      } else {
        result["Paramount"] = "<b>Paramountᐩ: </b>检测失败 ❗️";
      }
      resolve();
    }).catch(() => {
      result["Paramount"] = "<b>Paramountᐩ: </b>检测超时 🚦";
      resolve();
    });
  });
}

function testDiscovery() {
  return new Promise((resolve) => {
    const option = {
      url: BASE_URL_Discovery_token,
      opts: opts1,
      timeout: 2800,
      headers: { 'User-Agent': UA },
      verify: false,
    };
    $task.fetch(option).then(response => {
      if (response.statusCode !== 200) {
        result["Discovery"] = "<b>Discoveryᐩ: </b>检测失败 ❗️";
        return resolve();
      }
      const data = JSON.parse(response.body);
      const token = data?.data?.attributes?.token || "";
      if (!token) {
        result["Discovery"] = "<b>Discoveryᐩ: </b>未支持 🚫";
        return resolve();
      }
      const cookievalid = `_gcl_au=1.1.858579665.1632206782; _rdt_uuid=1632206782474.6a9ad4f2-8ef7-4a49-9d60-e071bce45e88; _scid=d154b864-8b7e-4f46-90e0-8b56cff67d05; _pin_unauth=dWlkPU1qWTRNR1ZoTlRBdE1tSXdNaTAwTW1Nd0xUbGxORFV0WWpZMU0yVXdPV1l6WldFeQ; _sctr=1|1632153600000; aam_fw=aam%3D9354365%3Baam%3D9040990; aam_uuid=24382050115125439381416006538140778858; st=${token}; gi_ls=0; _uetvid=a25161a01aa711ec92d47775379d5e4d; AMCV_BC501253513148ED0A490D45%40AdobeOrg=-1124106680%7CMCIDTS%7C18894%7CMCMID%7C24223296309793747161435877577673078228%7CMCAAMLH-1633011393%7C9%7CMCAAMB-1633011393%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1632413793s%7CNONE%7CvVersion%7C5.2.0; ass=19ef15da-95d6-4b1d-8fa2-e9e099c9cc38.1632408400.1632406594`;
      const option1 = {
        url: BASE_URL_Discovery,
        opts: opts1,
        timeout: 2800,
        headers: { 'User-Agent': UA, "Cookie": cookievalid },
        ciphers: "DEFAULT@SECLEVEL=1",
        verify: false,
      };
      $task.fetch(option1).then(resp => {
        const data = JSON.parse(resp.body);
        const locationd = data?.data?.attributes?.currentLocationTerritory || "";
        result["Discovery"] = locationd === "us" ? 
          "<b>Discoveryᐩ: </b>支持 🎉 " : 
          "<b>Discoveryᐩ: </b>未支持 🚫";
        resolve();
      }).catch(() => {
        result["Discovery"] = "<b>Discoveryᐩ: </b>检测失败 ❗️";
        resolve();
      });
    }).catch(() => {
      result["Discovery"] = "<b>Discoveryᐩ: </b>检测超时 🚦";
      resolve();
    });
  });
}

// ChatGPT检测（更新支持列表）
const support_countryCodes = ["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB","HK","MO"];

function testChatGPT() {
  return new Promise((resolve) => {
    const option = {
      url: BASE_URL_GPT,
      opts: opts1,
      timeout: 2800,
    };
    $task.fetch(option).then(response => {
      const respStr = JSON.stringify(response);
      if (respStr.indexOf("text/plain") === -1) {
        const option1 = { url: Region_URL_GPT, opts: opts1, timeout: 2800 };
        $task.fetch(option1).then(resp => {
          const region = resp.body.split("loc=")[1]?.split("\n")[0] || "";
          const isSupport = support_countryCodes.includes(region);
          result["ChatGPT"] = isSupport ? 
            `<b>ChatGPT: </b>支持 ${arrow} ⟦${flags.get(region.toUpperCase()) || '🇺🇸'}⟧ 🎉` : 
            "<b>ChatGPT: </b>未支持 🚫";
          resolve();
        }).catch(() => {
          result["ChatGPT"] = "<b>ChatGPT: </b>检测失败 ❗️";
          resolve();
        });
      } else {
        result["ChatGPT"] = "<b>ChatGPT: </b>未支持 🚫";
        resolve();
      }
    }).catch(() => {
      result["ChatGPT"] = "<b>ChatGPT: </b>检测超时 🚦";
      resolve();
    });
  });
}
