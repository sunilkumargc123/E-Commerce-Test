import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3003";

const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

// Throws a clear smoke-test error when an expected condition is false.
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Verifies that the current page fits within the viewport width.
async function assertNoHorizontalOverflow(page, label) {
  // Catch responsive layout regressions that unit tests cannot see.
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));

  assert(
    dimensions.scrollWidth <= dimensions.clientWidth + 1,
    `${label} has horizontal overflow: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`
  );
}

// Records browser console and page errors so the smoke test can fail on them.
function collectConsole(page, errors) {
  // Treat browser console errors as smoke-test failures.
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`page error: ${error.message}`);
  });
}

// Exercises the main storefront flow in one browser viewport.
async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  collectConsole(page, errors);

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  // Start every viewport from a clean cart so counts are deterministic.
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("heading", { name: "Shop Everyday Finds" }).waitFor();
  await page.getByRole("link", { name: "Home" }).waitFor();
  await page.getByRole("link", { name: "Cart with 0 items" }).waitFor();
  await page.locator(".product-card").first().waitFor();
  await page.locator(".product-card img").first().waitFor();
  await page.getByText("$9.99").first().waitFor();
  await page.getByText("/ 5").first().waitFor();
  await assertNoHorizontalOverflow(page, `${viewport.name} catalog`);

  await page.keyboard.press("Tab");
  const activeText = await page.evaluate(() => document.activeElement?.textContent ?? "");
  assert(
    activeText.includes("DummyJSON Market"),
    `${viewport.name} keyboard focus did not reach the brand link`
  );

  await page.locator(".product-card").first().click();
  await page.waitForURL(/\/products\/\d+$/);
  await page.getByRole("heading", { name: "Essence Mascara Lash Princess" }).waitFor();
  await page.getByText("Price").waitFor();
  await page.getByText("Discount").waitFor();
  await page.getByText("Rating").waitFor();
  await assertNoHorizontalOverflow(page, `${viewport.name} product detail`);

  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart with 2 items" }).waitFor();

  // Add a different product so the cart covers multiple lines and quantities.
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".product-card").nth(1).click();
  await page.waitForURL(/\/products\/\d+$/);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart with 3 items" }).waitFor();

  await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Your Cart" }).waitFor();
  await page.getByText("Essence Mascara Lash Princess").waitFor();
  await page.getByText("3 items").waitFor();
  await page.getByText(/^Total \$/).waitFor();
  await assertNoHorizontalOverflow(page, `${viewport.name} cart`);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Cart with 3 items" }).waitFor();
  await page.getByText("Essence Mascara Lash Princess").waitFor();

  // Removal persistence is checked by observing the shared header count.
  await page.getByRole("button", { name: "Remove Essence Mascara Lash Princess from cart" }).click();
  await page.getByRole("link", { name: "Cart with 1 items" }).waitFor();

  const remainingRemoveButtons = await page.getByRole("button", { name: /Remove .* from cart/ }).all();
  for (const button of remainingRemoveButtons) {
    await button.click();
  }
  await page.getByText("Your cart is empty").waitFor();

  await page.goto(`${baseUrl}/products/not-a-number`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Product not found" }).waitFor();

  assert(errors.length === 0, `${viewport.name} emitted browser errors:\n${errors.join("\n")}`);
  await context.close();
}

const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    await runViewport(browser, viewport);
    console.log(`✓ ${viewport.name} browser smoke passed`);
  }
} finally {
  await browser.close();
}
