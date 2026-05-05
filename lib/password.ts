const passwordRules = [
  {
    message: "至少 8 位",
    test: (password: string) => password.length >= 8,
  },
  {
    message: "包含字母",
    test: (password: string) => /[A-Za-z]/.test(password),
  },
  {
    message: "包含数字",
    test: (password: string) => /\d/.test(password),
  },
];

export function getPasswordIssues(password: string): string[] {
  return passwordRules
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.message);
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  const issues = getPasswordIssues(password);

  if (issues.length === 0) {
    return { isValid: true, message: "密码强度符合要求。" };
  }

  return {
    isValid: false,
    message: `密码需要${issues.join("、")}。`,
  };
}
