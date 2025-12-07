import { test, expect } from "@playwright/test";

test("User can log in and see dashboard", async ({ page }) => {
  // 1. Go to the login page (Make sure your app is running on localhost:3000!)
  const email = process.env.TEST_USER_EMAIL || "";
  const password = process.env.TEST_USER_PASSWORD || "";

  if (!email || !password) {
    throw new Error(
      "⚠️ Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in .env.local"
    );
  }

  await page.goto("http://localhost:3000/login");

  // 2. Check if we are on the right page
  await expect(page.getByText("Sign In", { exact: true })).toBeVisible();
  console.log(process.env.TEST_USER_EMAIL, "user email env var");
  // 3. Fill in the form (Replace these with a REAL test account you created)
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  // 4. Click the button
  await page.getByRole("button", { name: "Sign In with Email" }).click();

  // 5. Wait for the redirect to the dashboard
  // (Playwright automatically waits/retries until this passes)
  await expect(page).toHaveURL("http://localhost:3000/");

  // 6. Verify we see the dashboard title
  await expect(
    page.getByRole("heading", { name: "My Portfolio" })
  ).toBeVisible();
});
