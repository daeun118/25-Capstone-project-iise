/**
 * E2E Test for Account Deletion UI
 *
 * Tests the improved account deletion UI design:
 * - Button visibility in danger zone
 * - Dialog modern UI and animations
 * - Form validation and interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Account Deletion UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Perform login (assuming test account exists)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for redirect to home or library
    await page.waitForURL(/\/(library|feed|$)/);

    // Navigate to My page
    await page.goto('/my');
    await page.waitForLoadState('networkidle');
  });

  test('should display danger zone section with improved design', async ({ page }) => {
    // Check if danger zone section is visible
    const dangerZone = page.locator('text=위험 영역').first();
    await expect(dangerZone).toBeVisible();

    // Check for glass morphism styling
    const dangerSection = page.locator('div').filter({ hasText: '위험 영역' }).first().locator('..');
    const bgClass = await dangerSection.getAttribute('class');
    expect(bgClass).toContain('backdrop-blur');
    expect(bgClass).toContain('border-destructive');

    // Check if delete button is visible and has proper styling
    const deleteButton = page.locator('button').filter({ hasText: '회원탈퇴' });
    await expect(deleteButton).toBeVisible();

    // Check button has outline variant and enhanced styling
    const buttonClass = await deleteButton.getAttribute('class');
    expect(buttonClass).toContain('border-2');
    expect(buttonClass).toContain('hover:bg-destructive');
    expect(buttonClass).toContain('shadow-lg');
  });

  test('should open modern dialog with animations', async ({ page }) => {
    // Click the delete account button
    await page.click('button:has-text("회원탈퇴")');

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]');

    // Check for gradient border accent
    const gradientBorder = page.locator('[role="dialog"] >> div[style*="linear-gradient"]').first();
    await expect(gradientBorder).toBeVisible();

    // Check dialog title with icon
    const dialogTitle = page.locator('[role="dialog"] >> text=회원탈퇴');
    await expect(dialogTitle).toBeVisible();

    // Check for animated list items
    const dataItems = page.locator('[role="dialog"] >> ul >> li');
    const count = await dataItems.count();
    expect(count).toBe(6); // Should have 6 data type items

    // Check each item has an icon
    for (let i = 0; i < count; i++) {
      const item = dataItems.nth(i);
      await expect(item).toBeVisible();
      const icon = item.locator('svg').first();
      await expect(icon).toBeVisible();
    }
  });

  test('should validate form inputs properly', async ({ page }) => {
    // Open dialog
    await page.click('button:has-text("회원탈퇴")');
    await page.waitForSelector('[role="dialog"]');

    // Try to submit without password
    const deleteButton = page.locator('[role="dialog"] >> button:has-text("계정 영구 삭제")');
    await expect(deleteButton).toBeDisabled();

    // Enter password
    await page.fill('[role="dialog"] >> input[type="password"]', 'testpassword123');

    // Button should still be disabled without checkbox
    await expect(deleteButton).toBeDisabled();

    // Check the confirmation checkbox
    await page.click('[role="dialog"] >> input[type="checkbox"]');

    // Now the button should be enabled
    await expect(deleteButton).toBeEnabled();

    // Check for gradient button styling
    const buttonClass = await deleteButton.getAttribute('class');
    expect(buttonClass).toContain('bg-gradient-to-r');
    expect(buttonClass).toContain('from-red-600');
    expect(buttonClass).toContain('shadow-lg');
  });

  test('should show visual feedback on interactions', async ({ page }) => {
    // Open dialog
    await page.click('button:has-text("회원탈퇴")');
    await page.waitForSelector('[role="dialog"]');

    // Type in password field
    const passwordInput = page.locator('[role="dialog"] >> input[type="password"]');
    await passwordInput.fill('test');

    // Check for password indicator (pulse animation dot)
    const indicator = page.locator('[role="dialog"] >> .animate-pulse');
    await expect(indicator).toBeVisible();

    // Check the confirmation checkbox
    const checkbox = page.locator('[role="dialog"] >> input[type="checkbox"]');
    await checkbox.click();

    // Check for confirmation message that appears
    const confirmMessage = page.locator('text=최종 확인되었습니다');
    await expect(confirmMessage).toBeVisible();
  });

  test('should handle cancel action properly', async ({ page }) => {
    // Open dialog
    await page.click('button:has-text("회원탈퇴")');
    await page.waitForSelector('[role="dialog"]');

    // Fill some data
    await page.fill('[role="dialog"] >> input[type="password"]', 'test');
    await page.click('[role="dialog"] >> input[type="checkbox"]');

    // Click cancel button
    await page.click('[role="dialog"] >> button:has-text("취소")');

    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Reopen dialog - fields should be reset
    await page.click('button:has-text("회원탈퇴")');
    await page.waitForSelector('[role="dialog"]');

    const passwordInput = page.locator('[role="dialog"] >> input[type="password"]');
    const checkbox = page.locator('[role="dialog"] >> input[type="checkbox"]');

    await expect(passwordInput).toHaveValue('');
    await expect(checkbox).not.toBeChecked();
  });
});