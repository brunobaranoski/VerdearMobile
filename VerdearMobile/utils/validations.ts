/**
 * Validações de formulários
 */

/**
 * Valida CPF (11 dígitos, não pode ser todos zeros ou dígitos repetidos)
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 000.000.000-00)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação do CPF usando algoritmo oficial
  let sum = 0;
  let remainder;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  // Valida segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

/**
 * Valida CNPJ (14 dígitos, não pode ser todos zeros ou dígitos repetidos)
 */
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validação do CNPJ usando algoritmo oficial
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Valida CPF ou CNPJ automaticamente baseado no tamanho
 */
export const validateCPForCNPJ = (value: string): { valid: boolean; message?: string } => {
  const clean = value.replace(/\D/g, '');

  if (clean.length === 0) {
    return { valid: false, message: 'CPF/CNPJ não pode estar vazio.' };
  }

  if (clean.length === 11) {
    const isValid = validateCPF(clean);
    return {
      valid: isValid,
      message: isValid ? undefined : 'CPF inválido.',
    };
  }

  if (clean.length === 14) {
    const isValid = validateCNPJ(clean);
    return {
      valid: isValid,
      message: isValid ? undefined : 'CNPJ inválido.',
    };
  }

  return {
    valid: false,
    message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos.',
  };
};

/**
 * Valida telefone brasileiro (9 dígitos, não pode ser todos zeros)
 */
export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 0) {
    return { valid: false, message: 'Telefone não pode estar vazio.' };
  }

  // Aceita 10 ou 11 dígitos (com DDD)
  // Ex: (11) 98765-4321 = 11987654321 (11 dígitos)
  // Ex: (11) 3456-7890 = 1134567890 (10 dígitos)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return {
      valid: false,
      message: 'Telefone deve ter 10 ou 11 dígitos (com DDD).',
    };
  }

  // Verifica se todos os dígitos são zeros
  if (/^0+$/.test(cleanPhone)) {
    return { valid: false, message: 'Telefone inválido.' };
  }

  // Se tiver 11 dígitos, o terceiro dígito deve ser 9 (celular)
  if (cleanPhone.length === 11 && cleanPhone[2] !== '9') {
    return {
      valid: false,
      message: 'Número de celular deve começar com 9 após o DDD.',
    };
  }

  return { valid: true };
};

/**
 * Valida formato de e-mail
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const cleanEmail = email.trim();

  if (cleanEmail.length === 0) {
    return { valid: false, message: 'E-mail não pode estar vazio.' };
  }

  // Regex para validar e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, message: 'E-mail inválido.' };
  }

  return { valid: true };
};

/**
 * Valida senha (mínimo 6 caracteres)
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length === 0) {
    return { valid: false, message: 'Senha não pode estar vazia.' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres.' };
  }

  return { valid: true };
};

/**
 * Valida nome completo (mínimo 2 palavras)
 */
export const validateFullName = (name: string): { valid: boolean; message?: string } => {
  const cleanName = name.trim();

  if (cleanName.length === 0) {
    return { valid: false, message: 'Nome não pode estar vazio.' };
  }

  const words = cleanName.split(' ').filter((word) => word.length > 0);

  if (words.length < 2) {
    return { valid: false, message: 'Digite seu nome completo.' };
  }

  return { valid: true };
};
