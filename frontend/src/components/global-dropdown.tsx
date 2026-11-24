'use client';

import { Children, isValidElement, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Option = { value: string; label: string; disabled: boolean };
type Props = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
};

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return '';
}

function readOptions(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement(child) || child.type !== 'option') return [];
    const option = child.props as { value?: string; disabled?: boolean; children?: ReactNode };
    return [{ value: option.value ?? '', label: textOf(option.children), disabled: !!option.disabled }];
  });
}

export function GlobalDropdown({ value, onValueChange, children, id: suppliedId, disabled = false, name, required = false, 'aria-label': ariaLabel }: Props) {
  const generatedId = useId();
  const id = suppliedId ?? `${generatedId}-trigger`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeaheadRef = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const options = useMemo(() => readOptions(children), [children]);
  const selectedIndex = options.findIndex(option => option.value === value);
  const listboxId = `${id}-listbox`;

  const firstEnabled = () => options.findIndex(option => !option.disabled);
  const lastEnabled = () => options.reduce((last, option, index) => option.disabled ? last : index, -1);
  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : firstEnabled());
    setOpen(true);
  };
  const closeMenu = () => setOpen(false);
  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onValueChange(option.value);
    setActiveIndex(index);
    closeMenu();
  };
  const moveActive = (direction: -1 | 1) => {
    if (!options.length) return;
    for (let step = 1; step <= options.length; step++) {
      const index = (activeIndex + direction * step + options.length) % options.length;
      if (!options[index].disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, listboxId, open]);

  useEffect(() => () => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') {
      closeMenu();
      return;
    }
    if (event.key === 'Escape') {
      closeMenu();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu();
      else moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? firstEnabled() : lastEnabled());
      setOpen(true);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) selectOption(activeIndex);
      else openMenu();
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => { typeaheadRef.current = ''; }, 700);
      let index = options.findIndex(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(typeaheadRef.current));
      if (index < 0 && typeaheadRef.current.length > 1) {
        typeaheadRef.current = event.key.toLocaleLowerCase();
        index = options.findIndex(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(typeaheadRef.current));
      }
      if (index >= 0) {
        setActiveIndex(index);
        setOpen(true);
      }
    }
  };

  const current = options[selectedIndex];
  return <div className="global-dropdown" ref={rootRef}>
    <button
      id={id}
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
      aria-required={required || undefined}
      disabled={disabled}
      className="global-dropdown__trigger"
      onClick={() => open ? closeMenu() : openMenu()}
      onKeyDown={handleKeyDown}
    >
      <span>{current?.label ?? ''}</span>
      <ChevronDown className="global-dropdown__chevron" size={18} aria-hidden="true" />
    </button>
    <div id={listboxId} className="global-dropdown__menu" role="listbox" aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : id} hidden={!open}>
      {options.map((option, index) => <div
        id={`${listboxId}-option-${index}`}
        key={`${option.value}-${index}`}
        role="option"
        aria-selected={value === option.value}
        aria-disabled={option.disabled || undefined}
        className={`global-dropdown__option${index === activeIndex ? ' global-dropdown__option--active' : ''}`}
        onMouseEnter={() => { if (!option.disabled) setActiveIndex(index); }}
        onMouseDown={event => event.preventDefault()}
        onClick={event => { event.preventDefault(); event.stopPropagation(); selectOption(index); }}
      >
        <span>{option.label}</span>
        {value === option.value && <Check size={16} aria-hidden="true" />}
      </div>)}
    </div>
    <select
      className="global-dropdown__native"
      aria-hidden="true"
      tabIndex={-1}
      value={value}
      name={name}
      required={required}
      disabled={disabled}
      onChange={() => {}}
      onInvalid={event => {
        event.preventDefault();
        const firstInvalid = event.currentTarget.form?.querySelector(':invalid');
        if (firstInvalid === event.currentTarget) {
          openMenu();
          triggerRef.current?.focus();
        }
      }}
    >
      {options.map((option, index) => <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
  </div>;
}
