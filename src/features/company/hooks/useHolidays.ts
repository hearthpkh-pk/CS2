'use client';

import { useCallback } from 'react';
import { useCompanyConfig } from './useCompanyConfig';
import { holidayService } from '@/services/holidayService';
import { PublicHoliday } from '@/types';

/**
 * useHolidays Hook (The Bridge)
 * Bridges the UI with the Holiday Service logic and Company Config state.
 */
export const useHolidays = () => {
  const { config, saveHoliday, deleteHoliday } = useCompanyConfig();

  const isHoliday = useCallback((date: Date) => {
    return holidayService.getHoliday(date, config.holidays || []);
  }, [config.holidays]);

  const getPayMultiplier = useCallback((date: Date) => {
    return holidayService.getPayMultiplier(date, config.holidays || []);
  }, [config.holidays]);

  const addHoliday = useCallback((holiday: PublicHoliday) => {
    return saveHoliday(holiday);
  }, [saveHoliday]);

  const removeHoliday = useCallback((id: string) => {
    return deleteHoliday(id);
  }, [deleteHoliday]);

  return {
    holidays: config.holidays || [],
    isHoliday,
    getPayMultiplier,
    addHoliday,
    removeHoliday,
    generatePolicyText: () => holidayService.generatePolicyDescription(config.holidays || [])
  };
};
