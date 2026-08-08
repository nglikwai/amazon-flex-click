import { loadConfig } from "../config";
import { OCRService } from "./OCRService";
import { ScreenshotService } from "./ScreenshotService";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const robot = require("@jitsi/robotjs");

type Log = (message: string) => void;
export type Page = "offers" | "home" | "landing" | "signin-form" | "unknown";

const HOME_PAGE_TITLES = [
  "updates",
  "schedule",
  "your dashboard",
  "resource portal",
  "calendar",
  "earnings",
  "settings",
  "help",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function click(x: number, y: number): Promise<void> {
  robot.moveMouse(x, y);
  await delay(150);
  robot.mouseClick();
}

async function typeText(
  text: string,
  shouldAbort: () => boolean = () => false,
): Promise<void> {
  for (const char of text) {
    if (shouldAbort()) throw new Error("Login aborted");
    robot.typeString(char);
    await delay(80);
  }
}

async function detectPage(
  config: ReturnType<typeof loadConfig>,
  ocr: OCRService,
  log: Log,
): Promise<Page> {
  // Check signInButtonArea for "Sign in with Amazon" → landing page
  const sib = config.signInButtonArea;
  if (sib?.width > 0 && sib?.height > 0) {
    try {
      const buf = await ScreenshotService.takeRegionScreenshot(
        sib.x,
        sib.y,
        sib.width,
        sib.height,
      );
      const text = await ocr.detectText(buf);
      console.log(
        `Page check (signInButton): "${text.trim().replace(/\n/g, " ")}"`,
      );
      if (text.toLowerCase().includes("sign in with amazon")) return "landing";
    } catch {
      log("Could not read signInButtonArea");
    }
  }

  // Check pageTitleArea for known titles
  const pta = config.pageTitleArea;
  if (pta?.width > 0 && pta?.height > 0) {
    try {
      const buf = await ScreenshotService.takeRegionScreenshot(
        pta.x,
        pta.y,
        pta.width,
        pta.height,
      );
      const text = await ocr.detectText(buf);
      const lower = text.toLowerCase();
      console.log(`Page check (title): "${text.trim().replace(/\n/g, " ")}"`);
      if (lower.includes("sign in")) return "signin-form";
      if (lower.includes("offers")) return "offers";
      if (HOME_PAGE_TITLES.some((t) => lower.includes(t))) return "home";
    } catch {
      log("Could not read pageTitleArea");
    }
  }

  return "unknown";
}

export async function detectCurrentPage(log: Log = () => {}): Promise<Page> {
  const config = loadConfig();
  const ocr = new OCRService();
  try {
    await ocr.initialize();
    return await detectPage(config, ocr, log);
  } finally {
    await ocr.cleanup();
  }
}

export async function navigateToOffers(log: Log = () => {}): Promise<void> {
  const config = loadConfig();

  console.log("Navigate: closing notification modal");
  await click(config.notificationCloseButtonX, config.notificationCloseButtonY);
  await delay(500);

  console.log("Navigate: opening menu");
  await click(config.menuButtonX, config.menuButtonY);
  await delay(500);

  log("Navigate: clicking Offer");
  await click(config.offerButtonX, config.offerButtonY);
  await delay(1000);
}

export async function runLoginFlow(
  log: Log = () => {},
  shouldAbort: () => boolean = () => false,
): Promise<void> {
  const config = loadConfig();
  const { amazonEmail, amazonPassword } = config;

  if (!amazonEmail || !amazonPassword) {
    throw new Error(
      "Amazon credentials not set. Save them on the Account page first.",
    );
  }

  function checkAbort() {
    if (shouldAbort()) throw new Error("Login aborted");
  }

  // ── Check current page first ──
  log("Login: detecting current page...");
  const initialPage = await detectCurrentPage(log);
  console.log(`Login: initial page = ${initialPage}`);

  if (initialPage === "landing" || initialPage === "signin-form") {
    // Already signed out — go straight to sign-in
    checkAbort();
    await signInFromPage(initialPage, log, shouldAbort);
    return;
  }

  // ── Pre-check: navigate to Offers and verify app is ready ──
  log("Login: navigating to Offers...");
  await navigateToOffers(log);

  checkAbort();
  log("Login: verifying page...");
  const preCheck = await detectCurrentPage(log);
  console.log(`Login: page = ${preCheck}`);

  if (preCheck !== "offers") {
    log("App is not ready");
    throw new Error("App is not ready");
  }

  checkAbort();

  // ── Sign out ──
  // 0. Focus the app
  console.log("Login: focusing app");
  await click(config.logoutButtonX, config.logoutButtonY);
  await delay(500);

  // 1. Open menu
  checkAbort();
  console.log("Login: opening menu");
  await click(config.menuButtonX, config.menuButtonY);
  await delay(500);

  // 2. Click Setting
  checkAbort();
  console.log("Login: opening settings");
  await click(config.settingButtonX, config.settingButtonY);
  await delay(500);

  // 3. Click Sign out
  checkAbort();
  log("Login: clicking sign out");
  await click(config.logoutButtonX, config.logoutButtonY);
  await delay(500);

  // 4. Confirm sign out
  checkAbort();
  console.log("Login: confirming sign out");
  await click(config.confirmSignOutButtonX, config.confirmSignOutButtonY);
  await delay(3000);

  // ── Detect post-sign-out page ──
  checkAbort();
  console.log("Login: detecting page after sign out...");
  const postSignOut = await detectCurrentPage(log);
  console.log(`Login: page after sign out = ${postSignOut}`);

  if (postSignOut !== "landing" && postSignOut !== "signin-form") {
    log("App is not ready");
    throw new Error("App is not ready");
  }

  // ── Sign in ──
  checkAbort();
  await signInFromPage(postSignOut, log, shouldAbort);
}

export async function signInFromPage(
  page: "landing" | "signin-form",
  log: Log = () => {},
  shouldAbort: () => boolean = () => false,
): Promise<void> {
  const config = loadConfig();
  const { amazonEmail, amazonPassword } = config;

  if (!amazonEmail || !amazonPassword) {
    throw new Error("Amazon credentials not set. Save them on the Account page first.");
  }

  function checkAbort() {
    if (shouldAbort()) throw new Error("Login aborted");
  }

  if (page === "landing") {
    checkAbort();
    console.log('Login: clicking "Sign in with Amazon"');
    const a = config.signInButtonArea;
    await click(a.x + Math.floor(a.width / 2), a.y + Math.floor(a.height / 2));
    await delay(2000);
  }

  checkAbort();
  log("Login: clicking username field");
  await click(config.usernameButtonX, config.usernameButtonY);
  await delay(500);

  checkAbort();
  console.log("Login: clearing username field");
  for (let i = 0; i < 40; i++) {
    if (shouldAbort()) throw new Error("Login aborted");
    robot.keyTap("backspace");
    await delay(50);
  }

  checkAbort();
  log("Login: typing email");
  await typeText(amazonEmail, shouldAbort);
  await delay(500);

  checkAbort();
  log("Login: tabbing to password field");
  robot.keyTap("tab");
  await delay(500);

  checkAbort();
  log("Login: typing password");
  await typeText(amazonPassword, shouldAbort);
  await delay(500);

  checkAbort();
  log("Login: clicking sign in");
  await click(config.signButtonX, config.signButtonY);

  checkAbort();
  log("Login: waiting for login...");
  await delay(5000);

  checkAbort();
  log("Login: clicking Confirm switch account (if present)");
  await click(config.signButtonX, config.signButtonY);

  checkAbort();
  await navigateToOffers(log);

  log("Login: done ✓");
}
