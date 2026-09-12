import { expect, test } from '@playwright/test';

test('flow A: counters mutate, persist, and turns advance', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  await expect(page.getByText("Player 1's Turn")).toBeVisible();

  const activeCard = page.locator('.player-card.active').first();
  const counterInc = activeCard.getByRole('button', { name: 'Increase counter' }).first();
  const counterDec = activeCard.getByRole('button', { name: 'Decrease counter' }).first();
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

test('counter interactions support taps, holds, modes, preview, commit, and cancel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  const card = page.locator('.player-card.active').first();
  const display = card.locator('.counter-display').first();
  const plus = card.getByRole('button', { name: 'Increase counter' }).first();
  const minus = card.getByRole('button', { name: 'Decrease counter' }).first();

  await expect(display).toHaveText('0');
  await plus.click();
  await minus.click();
  await expect(display).toHaveText('0');

  await plus.hover();
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await expect(display).toHaveText('5');

  await display.dispatchEvent('pointerdown');
  await page.waitForTimeout(600);
  await display.dispatchEvent('pointerup');
  const input = card.getByTestId(/^counter-input-/).first();
  await expect(input).toHaveValue('5');

  const edit = card.getByTestId(/^counter-edit-/).first();
  const editPlus = edit.getByRole('button', { name: '+' });
  await editPlus.click();
  await expect(editPlus).toHaveAttribute('aria-pressed', 'true');
  await input.fill('3');
  await expect(edit.locator('.counter-preview')).toHaveText('+3');
  await edit.getByRole('button', { name: '=' }).click();
  await input.fill('9');
  await edit.getByTestId(/^counter-ok-/).click();
  await expect(display).toHaveText('9');

  await display.dblclick();
  await expect(card.getByTestId(/^counter-input-/)).toHaveValue('');
  await card.getByTestId(/^counter-input-/).fill('4');
  await card.getByTestId(/^counter-ok-/).click();
  await expect(display).toHaveText('13');

  await display.dispatchEvent('pointerdown');
  await page.waitForTimeout(600);
  await display.dispatchEvent('pointerup');
  await card.getByTestId(/^counter-input-/).fill('99');
  await card.getByTestId(/^counter-cancel-/).click();
  await expect(display).toHaveText('13');
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
  const counterDec = activeCard.getByRole('button', { name: 'Decrease counter' }).first();

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
  const counterInc = activeCard.getByRole('button', { name: 'Increase counter' }).first();
  const counterDec = activeCard.getByRole('button', { name: 'Decrease counter' }).first();

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
    await expect(page.locator('.player-card.active').first().locator('.counter-display').first()).toHaveText('1');
  });
});
