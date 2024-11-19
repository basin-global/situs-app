export function validateDomainName(name: string) {
  // Basic validation - just check for empty string and spaces
  if (!name) {
    return {
      isValid: false,
      message: "Name cannot be empty"
    };
  }

  if (name.includes(' ')) {
    return {
      isValid: false,
      message: "Spaces are not allowed"
    };
  }

  // Check length (keep any existing length validation)
  if (name.length < 1) {
    return {
      isValid: false,
      message: "Name is too short"
    };
  }

  if (name.length > 32) {
    return {
      isValid: false,
      message: "Name is too long (max 32 characters)"
    };
  }

  return {
    isValid: true,
    message: null
  };
}