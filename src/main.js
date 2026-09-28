import { chromium } from "playwright";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

const playwrightCorePath = path.dirname(
require.resolve("playwright-core/package.json")
);

const browserPath = path.join(
playwrightCorePath,
".local-browsers",
"chromium-1243",
"chrome-linux64",
"chrome"
);

export default async ({ req, res, log, error }) => {
let browser;

try {
log("Chromium executable path:");
log(browserPath);
log("Starting Chromium...");

```
browser = await chromium.launch({
  headless: true,
  executablePath: browserPath
});

log("Chromium launched!");

const page = await browser.newPage();

const logs = [];
const errors = [];
const failedRequests = [];

page.on("console", (message) => {
  logs.push({
    type: message.type(),
    text: message.text()
  });
});

page.on("pageerror", (exception) => {
  errors.push({
    message: exception.message
  });
});

page.on("requestfailed", (request) => {
  failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText || "Unknown error"
  });
});

const url = req.query?.url || "https://example.com";

log("Opening URL:");
log(url);

await page.goto(url, {
  waitUntil: "domcontentloaded",
  timeout: 30000
});

const title = await page.title();

await browser.close();
browser = null;

return res.json({
  success: true,
  url,
  title,
  logs,
  errors,
  failedRequests
});
```

} catch (err) {
if (browser) {
await browser.close();
}

```
error(err.stack || err.message);

return res.json(
  {
    success: false,
    error: err.message
  },
  500
);
```

}
};
