import { chromium } from "playwright";

export default async ({ req, res, log, error }) => {
let browser;

```
try {
    log("Starting Chromium...");

    browser = await chromium.launch({
        headless: true
    });

    log("Chromium launched!");

    const page = await browser.newPage();

    const logs = [];
    const errors = [];
    const failedRequests = [];

    page.on("console", message => {
        logs.push({
            type: message.type(),
            text: message.text()
        });
    });

    page.on("pageerror", exception => {
        errors.push({
            message: exception.message
        });
    });

    page.on("requestfailed", request => {
        failedRequests.push({
            url: request.url(),
            error: request.failure()?.errorText || "Unknown error"
        });
    });

    const url = req.query?.url || "https://example.com";

    log(`Opening ${url}`);

    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
    });

    const title = await page.title();

    await browser.close();

    return res.json({
        success: true,
        url,
        title,
        logs,
        errors,
        failedRequests
    });

} catch (err) {
    if (browser) {
        await browser.close();
    }

    error(err.stack || err.message);

    return res.json({
        success: false,
        error: err.message
    }, 500);
}
```

};
