export function calculateBMI(heightCm: number, weightKg: number) {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return weightKg / (h * h);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
