export interface FloorOption {
  id: string;
  label: string;
  numericValue?: number; // Optional numeric value for filtering/comparison
}

export const FLOOR_OPTIONS: FloorOption[] = [
  { id: 'basement', label: 'Сутерен', numericValue: -1 },
  { id: 'ground', label: 'Партер', numericValue: 0 },
  { id: 'first-residential', label: 'Първи Жилищен', numericValue: 1 },
  { id: 'not-last', label: 'Непоследен', numericValue: 2 },
  { id: 'last', label: 'Последен', numericValue: 3 },
  { id: 'attic', label: 'Таванско', numericValue: 99 },
];

// Helper function to get floor option by ID
export function getFloorOptionById(id: string): FloorOption | undefined {
  return FLOOR_OPTIONS.find(option => option.id === id);
}

// Helper function to get floor option by numeric value
export function getFloorOptionByNumericValue(value: number): FloorOption | undefined {
  return FLOOR_OPTIONS.find(option => option.numericValue === value);
}

// Helper function to get floor label by ID (for display purposes)
export function getFloorLabel(floorId: string | number | undefined | null): string {
  if (!floorId) return '';
  
  // If it's already a string ID (like "basement", "ground"), find the option
  if (typeof floorId === 'string') {
    const option = getFloorOptionById(floorId);
    if (option) return option.label;
    
    // If not found, try to parse as number (for backward compatibility)
    const numValue = parseInt(floorId, 10);
    if (!isNaN(numValue)) {
      const numOption = getFloorOptionByNumericValue(numValue);
      if (numOption) return numOption.label;
    }
    
    // If still not found, return the original value (for backward compatibility)
    return floorId;
  }
  
  // If it's a number, find by numeric value
  if (typeof floorId === 'number') {
    const option = getFloorOptionByNumericValue(floorId);
    if (option) return option.label;
    // Fallback: return as number string
    return String(floorId);
  }
  
  return '';
}

