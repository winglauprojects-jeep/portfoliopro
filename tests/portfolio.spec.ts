import { test, expect } from "@playwright/test";
import { StockHolding } from "@/types";

// Define the test data
const RANDOM_ID = Math.floor(Math.random() * 10000);
const ACCOUNT_NAME = `Test Account ${RANDOM_ID}`;

// Define the test data using the dynamic name
const TEST_STOCK: Partial<StockHolding> = {
  tickerSymbol: "TEST-TICKER",
  accountName: ACCOUNT_NAME, // 👈 Use the unique name
  shareCount: 10,
  averagePurchasePrice: 150.5,
};

test.beforeEach(async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL || "";
  const password = process.env.TEST_USER_PASSWORD || "";

  if (!email || !password) throw new Error("Missing test credentials");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In with Email" }).click();
  await expect(page).toHaveURL("/");
});

test("User can add and remove a stock entry", async ({ page }) => {
  // --- PART 1: ADD STOCK ---

  // 1. Fill Ticker
  await page.getByLabel("Stock Symbol").fill(TEST_STOCK.tickerSymbol!);

  // 2. Fill Shares (Convert number to string)
  await page.getByLabel("Shares").fill(TEST_STOCK.shareCount!.toString());

  // 3. Fill Price
  await page
    .getByLabel("Avg. Price")
    .fill(TEST_STOCK.averagePurchasePrice!.toString());

  // 4. Fill Account (Complex Combobox)
  await page.getByRole("combobox", { name: "Account" }).click();
  await page
    .getByPlaceholder("Search or create...")
    .fill(TEST_STOCK.accountName!);
  await page.getByText(`Create "${TEST_STOCK.accountName}"`).click();

  // 5. Submit
  await page.getByRole("button", { name: "Add to Portfolio" }).click();

  // 6. Verify it appears
  // We look for a row that contains our specific ticker
  const row = page.getByRole("row", { name: TEST_STOCK.tickerSymbol });
  await expect(row).toBeVisible();

  // --- PART 2: REMOVE STOCK ---

  // 1. Setup a listener to auto-accept the "Are you sure?" dialog
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  // 2. Click "Open Menu" inside our specific row
  // (We reuse the 'row' locator from above)
  await row.getByRole("button", { name: /open menu/i }).click();

  // 3. Click "Delete Holding"
  await page.getByRole("menuitem", { name: "Delete Holding" }).click();

  // 4. Verify the row is GONE
  await expect(row).not.toBeVisible();
});
