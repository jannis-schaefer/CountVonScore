import { expect, test } from '@playwright/test';

test('flow A: counters mutate, persist, and turns advance', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  await expect(page.getByText("Player 1's Turn")).toBeVisible();

  const activeCard = page.locator('.player-card.active').first();
  const counterInc = activeCard.getByRole('button', { name: '+' }).first();
  const counterDec = activeCard.getByRole('button', { name: '−' }).first();
  const counterDisplay = activeCard.locator('.counter-display').first();

  await counterInc.click();
  await counterInc.click();
  await counterDec.click();
  await expect(counterDisplay).toHaveText('1');

  await page.getByRole('button', { name: 'End Turn' }).click();
  await expect(page.getByText("Player 2's Turn")).toBeVisible();

  await page.getByRole('button', { name: 'End Turn' }).click();
  await expect(page.getByText("Player 1's Turn")).toBeVisible();
  await expect(activeCard.locator('.counter-display').first()).toHaveText('1');
});

test('flow A edge: previous turn view opens and can return to current turn', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  await page.getByRole('button', { name: 'End Turn' }).click();
  await page.getByRole('button', { name: 'Previous Turn' }).click();

  await expect(page.getByText(/Saved turn result/i)).toBeVisible();
  await page.getByRole('button', { name: 'Return to Current' }).click();
  await expect(page.getByText(/Turn 2/)).toBeVisible();
});

test('flow A edge: decrement below zero remains stable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  const activeCard = page.locator('.player-card.active').first();
  const counterDisplay = activeCard.locator('.counter-display').first();
  const counterDec = activeCard.getByRole('button', { name: '−' }).first();

  await expect(counterDisplay).toHaveText('0');
  await counterDec.click();
  await expect(counterDisplay).toHaveText('-1');

  await page.getByRole('button', { name: 'End Turn' }).click();
  await expect(page.getByText("Player 2's Turn")).toBeVisible();
});

test('flow A edge bundle: ordered checks (2,3,1,4)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  const activeCard = page.locator('.player-card.active').first();
  const counterDisplay = activeCard.locator('.counter-display').first();
  const counterInc = activeCard.getByRole('button', { name: '+' }).first();
  const counterDec = activeCard.getByRole('button', { name: '−' }).first();

  await test.step('2) multi-action same-turn consistency', async () => {
    await expect(counterDisplay).toHaveText('0');
    await counterInc.click();
    await counterInc.click();
    await counterDec.click();
    await expect(counterDisplay).toHaveText('1');
  });

  await test.step('3) undo immediately reverts the latest current-turn action', async () => {
    await counterInc.click();
    await expect(counterDisplay).toHaveText('2');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(counterDisplay).toHaveText('1');
  });

  await test.step('1) turn order boundary wraparound remains correct', async () => {
    await page.getByRole('button', { name: 'End Turn' }).click();
    await expect(page.getByText("Player 2's Turn")).toBeVisible();
    await page.getByRole('button', { name: 'End Turn' }).click();
    await expect(page.getByText("Player 1's Turn")).toBeVisible();
  });

  await test.step('4) after boundary, reload + resume keeps coherent state', async () => {
    await page.getByRole('button', { name: 'Back' }).click();
    await page.reload();
    const resume = page.getByRole('button', { name: 'Resume' });
    await expect(resume).toBeEnabled();
    await resume.click();

    await expect(page.getByText("Player 1's Turn")).toBeVisible();
    await expect(page.getByText(/Turn 3/)).toBeVisible();
    await expect(page.locator('.player-card.active .counter-display').first()).toHaveText('1');
  });
});
