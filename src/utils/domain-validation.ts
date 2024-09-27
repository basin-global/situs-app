export function validateDomainName(accountName: string): { isValid: boolean; message: string | null } {
    if (!accountName || accountName.trim() === '') {
      return { isValid: false, message: 'Account name cannot be empty' };
    }
  
    const invalidCharacters = [
      '.', ' ', '%', '&', '?', '#', '/', ',', '\\',
      '­', '	', '͏', '؜', '܏', 'ᅟ', 'ᅠ', ' ', '឴', '឵', '᠎', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
      '​', '‌', '‍', '‎', '‏', ' ', ' ', '⁠', '⁡', '⁢', '⁣', '⁤', '⁪', '⁫', '⁬', '⁭', '⁮', '⁯', '　', '⠀', 'ㅤ', 'ﾠ',
      '𑂱', '𛲠', '𛲡', '𛲢', '𛲣', '𝅙', '𝅳', '𝅴', '𝅵', '𝅶', '𝅷', '𝅸', '𝅹', '𝅺', '', '', ''
    ];
  
    const invalidChar = invalidCharacters.find(char => accountName.includes(char));
    if (invalidChar) {
      return { isValid: false, message: `Character "${invalidChar}" is not allowed` };
    }
  
    // Only allow lowercase letters, numbers, and hyphens
    const validRegex = /^[a-z0-9-]+$/;
    if (!validRegex.test(accountName)) {
      return { isValid: false, message: 'Only lowercase letters, numbers, and hyphens are allowed' };
    }
  
    // Check length (1 to 140 characters)
    if (accountName.length < 1 || accountName.length > 140) {
      return { isValid: false, message: 'Account name must be between 1 and 140 characters long' };
    }
  
    return { isValid: true, message: null };
  }