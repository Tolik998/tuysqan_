import { expect, test } from "@playwright/test";

async function addFirstProduct(page: import("@playwright/test").Page) {
  await page.goto("/menu");
  await page
    .getByRole("button", { name: /^Добавить / })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Уменьшить" }).first(),
  ).toBeVisible();
}

test("adds a product to the persistent cart", async ({ page }) => {
  await addFirstProduct(page);
  await page.goto("/cart");
  await expect(page.getByText("Овсянка с яблоком и карамелью")).toBeVisible();
  await expect(page.getByText("Блюд: 1")).toBeVisible();
});

test("featured dish links open the requested menu item", async ({ page }) => {
  await page.goto("/menu?dish=oatmeal-apple-caramel");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Овсянка с яблоком и карамелью" }),
  ).toBeVisible();
});

test("checkout validates required delivery details", async ({ page }) => {
  await addFirstProduct(page);
  await page.goto("/checkout");
  await page.getByRole("button", { name: /Создать заказ/ }).click();
  await expect(page.getByText("Укажите имя")).toBeVisible();
  await expect(page.getByText("Укажите адрес доставки")).toBeVisible();
});

test("dine-in flow preselects a database-fed table", async ({ page }) => {
  await page.goto("/dine-in?table=table-7");
  await page
    .getByRole("button", { name: /^Добавить / })
    .first()
    .click();
  await page.getByRole("button", { name: "Открыть корзину: 1" }).click();
  await page.getByRole("link", { name: "Оформить заказ" }).click();
  await expect(page).toHaveURL(/\/dine-in\/cart\?table=table-7/);
  await expect(page.getByLabel("Номер столика")).toHaveValue("table-7");
  await expect(
    page.getByRole("button", { name: "Отправить заказ" }),
  ).toBeVisible();
});

test("admin routes are protected", async ({ page }) => {
  await page.goto("/admin/menu");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Вход для команды")).toBeVisible();
});
