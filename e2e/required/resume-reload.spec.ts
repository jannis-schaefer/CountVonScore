import { expect, test } from '@playwright/test';

test('flow B: game state survives reload and resume path works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  const activeCard = page.locator('.player-card.active').first();
  await activeCard.getByRole('button', { name: '+' }).first().click();
  await expect(activeCard.locator('.counter-display').first()).toHaveText('1');

  await page.getByRole('button', { name: 'Back' }).click();
  await page.reload();

  const resumeButton = page.getByRole('button', { name: 'Resume' });
  await expect(resumeButton).toBeEnabled();
  await resumeButton.click();

  await expect(page.getByText(/Turn 1|Turn 2/)).toBeVisible();
  await expect(page.locator('.counter-display').filter({ hasText: '1' }).first()).toBeVisible();
});
