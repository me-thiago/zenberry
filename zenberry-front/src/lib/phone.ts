/**
 * Phone utility functions
 * 
 * This module provides utilities for formatting, validating, and processing
 * phone numbers in the format +1 (XXX) XXX-XXXX
 */

// Regex para validar formato de telefone: +1 seguido de 10 dígitos
export const PHONE_REGEX = /^\+1\d{10}$/;

// Limite máximo de caracteres para telefone (+1 + 10 dígitos)
export const PHONE_MAX_LENGTH = 12;

/**
 * Formata o telefone para exibição: +15551234567 -> +1 (555) 123-4567
 * @param value - Valor do telefone (formatado ou não)
 * @returns Telefone formatado para exibição
 */
export function formatPhone(value: string): string {
  if (!value || value === "+1") return value || "";
  // Remove tudo que não é número ou +
  const cleaned = value.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+1")) {
    // Se não começa com +1, retornar apenas o que tem (sem formatação)
    return cleaned;
  }

  const digits = cleaned.slice(2); // Remove +1
  // Se não tem dígitos, retornar apenas +1 (sem parênteses)
  if (digits.length === 0) return "+1";
  // Só adicionar "(" quando tiver pelo menos 1 dígito
  if (digits.length <= 3) {
    return `+1 (${digits}`;
  }
  if (digits.length <= 6) return `+1 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Remove formatação do telefone: +1 (555) 123-4567 -> +15551234567
 * @param value - Valor formatado do telefone
 * @returns Telefone sem formatação
 */
export function unformatPhone(value: string): string {
  if (!value) return "";
  // Remove tudo que não é número ou +
  const cleaned = value.replace(/[^\d+]/g, "");
  // Garante que começa com +1
  if (cleaned.startsWith("+1")) return cleaned;
  if (cleaned.startsWith("1")) return "+" + cleaned;
  return "+1" + cleaned;
}

/**
 * Valida se o telefone está no formato correto
 * @param value - Valor do telefone
 * @returns true se válido ou vazio (campo opcional), false caso contrário
 */
export function isValidPhone(value: string | null | undefined): boolean {
  if (!value) return true; // Campo opcional
  return PHONE_REGEX.test(value);
}

/**
 * Verifica se deve mostrar erro de validação
 * @param value - Valor do telefone
 * @returns true se deve mostrar erro
 */
export function shouldShowPhoneError(value: string | null | undefined): boolean {
  if (!value) return false;
  return !isValidPhone(value);
}

/**
 * Normaliza o input do telefone, adicionando +1 se necessário
 * @param value - Valor digitado pelo usuário
 * @returns Valor normalizado com +1
 */
export function normalizePhoneInput(value: string): string {
  if (!value) return "+1";
  // Remove tudo que não é número ou +
  const cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+1")) return cleaned;
  if (cleaned.startsWith("+")) {
    return "+1" + cleaned.slice(1);
  }
  if (cleaned.startsWith("1")) {
    return "+" + cleaned;
  }
  return "+1" + cleaned;
}

/**
 * Limita o tamanho do telefone ao máximo permitido
 * @param value - Valor do telefone
 * @returns Telefone limitado ao tamanho máximo
 */
export function limitPhoneLength(value: string): string {
  if (value.length > PHONE_MAX_LENGTH) {
    return value.slice(0, PHONE_MAX_LENGTH);
  }
  return value;
}

/**
 * Verifica se o telefone está vazio ou contém apenas "+1"
 * @param value - Valor do telefone
 * @returns true se estiver vazio ou for apenas "+1"
 */
export function isPhoneEmptyOrPlusOne(value: string | null | undefined): boolean {
  return !value || value === "+1";
}

/**
 * Verifica se o valor está em um estado intermediário de formatação (como "+1 (")
 * @param value - Valor do telefone
 * @returns true se estiver em estado intermediário
 */
export function isPhoneInIntermediateState(value: string): boolean {
  return /^\+1\s*\(?\s*$/.test(value);
}

/**
 * Processa o valor do telefone quando o usuário digita
 * @param inputValue - Valor digitado pelo usuário
 * @returns Objeto com o valor processado (unformatted) e se deve limpar o campo
 */
export function processPhoneInputChange(inputValue: string): {
  unformatted: string;
  shouldClear: boolean;
} {
  // Se o usuário deletou tudo, limpar
  if (inputValue.length === 0) {
    return { unformatted: "", shouldClear: true };
  }

  // Se o valor é apenas "+" ou "+1", manter assim (sem formatação)
  if (inputValue === "+" || inputValue === "+1") {
    return { unformatted: "+1", shouldClear: false };
  }

  // Detectar estados intermediários de formatação (como "+1 (" ou "+1 (5")
  if (isPhoneInIntermediateState(inputValue)) {
    return { unformatted: "+1", shouldClear: false };
  }

  // Desformatar para obter apenas números
  const unformatted = unformatPhone(inputValue);

  // Se após desformatar não começa com +1, normalizar
  const normalized = unformatted.startsWith("+1")
    ? unformatted
    : normalizePhoneInput(unformatted);

  // Limitar ao tamanho máximo
  const limited = limitPhoneLength(normalized);

  return { unformatted: limited, shouldClear: false };
}

/**
 * Processa o valor do telefone quando o campo recebe foco
 * @param currentValue - Valor atual do campo
 * @returns Valor normalizado ou null se não precisar mudar
 */
export function processPhoneFocus(currentValue: string): string | null {
  // Se o campo estiver vazio ou não começar com +1, normalizar
  if (!currentValue || !currentValue.startsWith("+1")) {
    return normalizePhoneInput(currentValue);
  }
  return null; // Não precisa mudar
}

/**
 * Processa o valor do telefone quando o campo perde o foco
 * @param currentUnformatted - Valor atual não formatado
 * @returns Objeto indicando se deve limpar o campo e o valor formatado para exibição
 */
export function processPhoneBlur(
  currentUnformatted: string | null | undefined
): {
  shouldClear: boolean;
  displayValue: string;
} {
  // Se o valor é apenas "+1" ou vazio, limpar o campo (campo opcional)
  if (isPhoneEmptyOrPlusOne(currentUnformatted)) {
    return { shouldClear: true, displayValue: "" };
  }

  // Caso contrário, retornar valor formatado para exibição
  return {
    shouldClear: false,
    displayValue: currentUnformatted ? formatPhone(currentUnformatted) : "",
  };
}

