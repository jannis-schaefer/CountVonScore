import { expect, test } from '@playwright/test';

test('flow C (optional regression): settings roundtrip keeps app functional with default theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  await page.getByRole('button', { name: 'Settings' }).first().click();

  const themeSelect = page.locator('select.input').first();
  await expect(themeSelect).toBeVisible();
  await themeSelect.selectOption('generic');

  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText("Player 1's Turn")).toBeVisible();
  await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous Turn' })).toBeVisible();
});
