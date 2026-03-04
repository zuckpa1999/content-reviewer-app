import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initialValue when key is not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value when key already exists', () => {
    localStorage.setItem('key', JSON.stringify('persisted'));
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('persisted');
  });

  it('works with array initial values', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr', []));
    expect(result.current[0]).toEqual([]);
  });

  it('persists updated value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('key')!)).toBe('updated');
  });

  it('falls back to initialValue when stored JSON is corrupt', () => {
    localStorage.setItem('key', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('supports object values', () => {
    const obj = { name: 'Test', rating: 4 };
    localStorage.setItem('key', JSON.stringify(obj));
    const { result } = renderHook(() => useLocalStorage('key', {}));
    expect(result.current[0]).toEqual(obj);
  });
});
