for file in test/*.test.ts; do
  npx jest $file
done