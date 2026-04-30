import { useState, forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react';
import Input from './Input';
import { formatPhone } from '../lib/format';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

function handlePhoneInputChange(
  event: ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void
) {
  onChange(formatPhone(event.target.value));
}

function getFlag(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('1')) return '🇺🇸';
  if (digits.startsWith('44')) return '🇬🇧';
  if (digits.startsWith('234')) return '🇳🇬';
  if (digits.startsWith('91')) return '🇮🇳';
  if (digits.startsWith('61')) return '🇦🇺';
  if (digits.startsWith('49')) return '🇩🇪';
  if (digits.startsWith('33')) return '🇫🇷';
  if (digits.startsWith('55')) return '🇧🇷';
  if (digits.startsWith('86')) return '🇨🇳';
  return '🌍';
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label = 'Phone number', value, onChange, error, placeholder = '+1 (555) 123-4567', ...props }, ref) => {
    const [touched, setTouched] = useState(false);
    const showSuccess = touched && !error && isValidPhone(value);

    return (
      <Input
        ref={ref}
        type="tel"
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={e => handlePhoneInputChange(e, onChange)}
        onBlur={() => setTouched(true)}
        error={touched && error ? error : undefined}
        success={showSuccess}
        leftEl={<span className="text-lg">{getFlag(value)}</span>}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
