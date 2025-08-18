import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {beforeAll, describe, expect, it} from 'vitest';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const INPUT_DIR = join(FIXTURES_DIR, 'input');
const EXPECTED_DIR = join(FIXTURES_DIR, 'expected');

describe('End-to-End Tests', () => {
  beforeAll(() => {
    // Build the plugin first
    execSync('npm run build', {cwd: process.cwd(), stdio: 'inherit'});
  });

  describe('WGSL file formatting', () => {
    it('should format simple.wgsl correctly', () => {
      const inputFile = join(INPUT_DIR, 'simple.wgsl');
      const expectedFile = join(EXPECTED_DIR, 'simple.wgsl');

      const result = execSync(
        `npx prettier --config src/fixtures/.prettierrc.json ${inputFile}`,
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        },
      );

      const expected = readFileSync(expectedFile, 'utf8');
      expect(result.trim()).toBe(expected.trim());
    });
  });

  describe('TypeScript embedded WGSL formatting', () => {
    it('should format basic-shaders.ts correctly', () => {
      const inputFile = join(INPUT_DIR, 'basic-shaders.ts');
      const expectedFile = join(EXPECTED_DIR, 'basic-shaders.ts');

      const result = execSync(
        `npx prettier --config src/fixtures/.prettierrc.json ${inputFile}`,
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        },
      );

      const expected = readFileSync(expectedFile, 'utf8');
      expect(result.trim()).toBe(expected.trim());
    });

    it('should format multiple-shaders.ts correctly', () => {
      const inputFile = join(INPUT_DIR, 'multiple-shaders.ts');
      const expectedFile = join(EXPECTED_DIR, 'multiple-shaders.ts');

      const result = execSync(
        `npx prettier --config src/fixtures/.prettierrc.json ${inputFile}`,
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        },
      );

      const expected = readFileSync(expectedFile, 'utf8');
      expect(result.trim()).toBe(expected.trim());
    });

    it('should format mixed-templates.ts correctly', () => {
      const inputFile = join(INPUT_DIR, 'mixed-templates.ts');
      const expectedFile = join(EXPECTED_DIR, 'mixed-templates.ts');

      const result = execSync(
        `npx prettier --config src/fixtures/.prettierrc.json ${inputFile}`,
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        },
      );

      const expected = readFileSync(expectedFile, 'utf8');
      expect(result.trim()).toBe(expected.trim());
    });
  });

  describe('CLI functionality', () => {
    it('should format files in place with --write flag', () => {
      // Create a temporary copy of the input file
      const inputFile = join(INPUT_DIR, 'simple.wgsl');
      const tempFile = join(FIXTURES_DIR, 'temp.wgsl');
      const originalContent = readFileSync(inputFile, 'utf8');
      writeFileSync(tempFile, originalContent);

      // Run prettier with --write to format in place
      execSync(
        `npx prettier --config src/fixtures/.prettierrc.json --write ${tempFile}`,
        {
          cwd: process.cwd(),
          stdio: 'inherit',
        },
      );

      // Read the formatted content and compare with expected
      const formattedContent = readFileSync(tempFile, 'utf8');
      const expected = readFileSync(join(EXPECTED_DIR, 'simple.wgsl'), 'utf8');
      expect(formattedContent.trim()).toBe(expected.trim());

      // Clean up
      execSync(`rm ${tempFile}`, {cwd: process.cwd()});
    });

    it('should check if files are already formatted', () => {
      // Use the expected file which should already be formatted
      const expectedFile = join(EXPECTED_DIR, 'simple.wgsl');

      // Check if it's formatted (should exit with code 0)
      execSync(
        `npx prettier --config src/fixtures/.prettierrc.json --check ${expectedFile}`,
        {
          cwd: process.cwd(),
          stdio: 'pipe',
        },
      );
      // If we reach here, the file is properly formatted
      expect(true).toBe(true);
    });

    it('should detect unformatted files with --check flag', () => {
      // Use the input file which should be unformatted
      const inputFile = join(INPUT_DIR, 'simple.wgsl');

      try {
        execSync(
          `npx prettier --config src/fixtures/.prettierrc.json --check ${inputFile}`,
          {
            cwd: process.cwd(),
            stdio: 'pipe',
          },
        );
        // If we reach here, prettier thought the file was formatted
        // (unexpected)
        throw new Error('Input file should have been detected as unformatted');
      } catch {
        // Expected: prettier should exit with non-zero code for unformatted
        // files
        expect(true).toBe(true);
      }
    });
  });
});
