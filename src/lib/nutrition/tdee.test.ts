import assert from 'node:assert/strict';
import test from 'node:test';
import { activityFactorFromWeeklyDays, deriveMacroTargets, mifflinStJeorBmr } from './tdee';

test('mifflinStJeorBmr is sane for male', () => {
  const bmr = mifflinStJeorBmr(80, 180, 30, 'MALE');
  assert.ok(bmr > 1500 && bmr < 2500);
});

test('activityFactorFromWeeklyDays increases with frequency', () => {
  assert.ok(activityFactorFromWeeklyDays(1) < activityFactorFromWeeklyDays(6));
});

test('deriveMacroTargets returns positive macros', () => {
  const t = deriveMacroTargets(75, 175, 32, 'FEMALE', 4, 'GENERAL_FITNESS', 'MAINTAIN');
  assert.ok(t.calorieTarget > 1000);
  assert.ok(t.proteinG > 40);
});
