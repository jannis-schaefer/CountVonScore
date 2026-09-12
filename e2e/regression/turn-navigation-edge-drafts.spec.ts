import { expect, test, type Page } from '@playwright/test';

// Draft edge cases for future implementation. These are intentionally skipped
// until expected behavior and UX details are confirmed.

const playerCard = (page: Page, name: string) => page.locator('.player-card').filter({ hasText: name });

/**
 * Configures a 2-player Shared Device game with loss-elimination on Counter A
 * at threshold -1, plays 5 turns, navigates back to turn 3, edits Player 1's
 * own Counter A below the threshold, and applies the change so the
 * "Elimination/Win Threshold Reached" review panel appears.
 */
const setupThresholdReviewScenario = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Shared Device (All Players)' }).click();
  await page.locator('.card', { hasText: 'Player Count' }).getByRole('spinbutton').fill('2');
  await page.getByRole('button', { name: 'Edit Game Settings' }).click();

  await page.getByLabel('Enable Elimination').check();
  await page.locator('.settings-row', { hasText: 'Outcome Type' }).getByRole('combobox').selectOption('loss');
  await page
    .locator('.settings-row', { hasText: 'Trigger Rule' })
    .getByRole('combobox')
    .selectOption('stayAboveMinimum');
  await page.locator('.settings-row', { hasText: 'Threshold' }).locator('input').fill('-1');
  await page.getByRole('button', { name: 'Apply' }).click();

  await page.getByRole('button', { name: 'Confirm And Start' }).click();
  await page.getByRole('button', { name: 'Player 1' }).click();

  // Turn 1 (Player 1): no changes.
  await page.getByRole('button', { name: 'End Turn' }).click();
  // Turn 2 (Player 2): no changes.
  await page.getByRole('button', { name: 'End Turn' }).click();
  // Turn 3 (Player 1): no changes — this is the turn we'll edit historically.
  await page.getByRole('button', { name: 'End Turn' }).click();

  // Turn 4 (Player 2): increment own Counter A by +3.
  const player2Card = playerCard(page, 'Player 2');
  const player2Inc = player2Card.getByRole('button', { name: 'Increase counter' }).first();
  await player2Inc.click();
  await player2Inc.click();
  await player2Inc.click();
  await page.getByRole('button', { name: 'End Turn' }).click();

  // Turn 5 (Player 1 acting): decrement Player 2's Counter A by 2.
  const player2Dec = playerCard(page, 'Player 2').getByRole('button', { name: 'Decrease counter' }).first();
  await player2Dec.click();
  await player2Dec.click();
  await page.getByRole('button', { name: 'End Turn' }).click();

  // Now on turn 6 (Player 2's turn). Navigate back to viewing turn 3.
  await page.getByRole('button', { name: 'Previous Turn' }).click();
  await page.getByRole('button', { name: 'Previous Turn' }).click();
  await page.getByRole('button', { name: 'Previous Turn' }).click();

  // While viewing turn 3, decrement Player 1's own Counter A by 2 (now -2, crossing the -1 threshold).
  const activeCard = page.locator('.player-card.active').first();
  const activeDec = activeCard.getByRole('button', { name: 'Decrease counter' }).first();
  await activeDec.click();
  await activeDec.click();

  await page.getByRole('button', { name: 'Apply Changes and Return' }).click();

  await expect(page.getByRole('heading', { name: 'Elimination/Win Threshold Reached' })).toBeVisible();
};

test.describe('turn navigation edge case drafts', () => {
  test('historical edit reaches threshold and "keep phantom turns" preserves the full recalculation', async ({
    page,
  }) => {
    await setupThresholdReviewScenario(page);

    await page.getByRole('button', { name: 'Keep Phantom Turns And Damage' }).click();

    await expect(page.getByRole('heading', { name: 'Elimination/Win Threshold Reached' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous Turn' })).toBeEnabled();

    const player2Counter = playerCard(page, 'Player 2').locator('.counter-display').first();
    await expect(player2Counter).toHaveText('1');
  });

  test('historical edit reaches threshold and "continue from this point" truncates the future timeline', async ({
    page,
  }) => {
    await setupThresholdReviewScenario(page);

    await page.getByRole('button', { name: 'Continue From This Point' }).click();

    await expect(page.getByText("Player 2's Turn")).toBeVisible();

    const player2Counter = playerCard(page, 'Player 2').locator('.counter-display').first();
    await expect(player2Counter).toHaveText('0');
  });

  test('historical edit reaches threshold and "remove phantom turns" excludes the eliminated player\'s later turns', async ({
    page,
  }) => {
    await setupThresholdReviewScenario(page);

    await page.getByRole('button', { name: 'Remove Phantom Turns And Damage' }).click();

    await expect(page.getByRole('heading', { name: 'Elimination/Win Threshold Reached' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous Turn' })).toBeEnabled();

    const player2Counter = playerCard(page, 'Player 2').locator('.counter-display').first();
    await expect(player2Counter).toHaveText('3');
  });

  test('previous/next navigation disabled while historical turn is dirty until user resolves decision', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.getByRole('button', { name: 'Confirm And Start' }).click();
    await page.getByRole('button', { name: 'Player 1' }).click();

    await page.getByRole('button', { name: 'End Turn' }).click();
    await page.getByRole('button', { name: 'Previous Turn' }).click();
    await expect(page.getByText(/Saved turn result/i)).toBeVisible();

    const activeCard = page.locator('.player-card.active').first();
    await activeCard.getByRole('button', { name: 'Increase counter' }).first().click();

    const previousTurnButton = page.getByRole('button', { name: 'Previous Turn' });
    const returnToCurrentButton = page.getByRole('button', { name: 'Return to Current' });

    await expect(page.getByRole('heading', { name: 'Past Turn Changed' })).toBeVisible();
    await expect(previousTurnButton).toBeDisabled();
    await expect(returnToCurrentButton).toBeDisabled();

    await page.getByRole('button', { name: 'Apply Changes and Return' }).click();

    await expect(page.getByText("Player 2's Turn")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous Turn' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'End Turn' })).toBeEnabled();
  });
});
