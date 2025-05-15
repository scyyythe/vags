import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export utilities
export function exportToCSV(data: any[], filename: string) {
  // Convert data to CSV format
  let csv = '';
  
  // Get headers
  const headers = Object.keys(data[0]);
  csv += headers.join(',') + '\n';
  
  // Add rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special cases like dates, objects, etc.
      if (value instanceof Date) {
        return value.toLocaleDateString();
      } else if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  // Create and download the file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format dates consistently
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

// Enhanced search utility function that supports nested properties
export function searchItems<T>(items: T[], searchTerm: string, searchFields: string[]) {
  if (!searchTerm) return items;
  
  const lowerCaseSearch = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return searchFields.some(field => {
      // Handle nested fields like 'artwork.title'
      if (field.includes('.')) {
        const keys = field.split('.');
        let value = item as any;
        
        // Navigate through the object path
        for (const key of keys) {
          if (value && typeof value === 'object') {
            value = value[key];
          } else {
            return false;
          }
        }
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseSearch);
        }
        
        return false;
      } else {
        // Handle direct properties
        const value = (item as any)[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseSearch);
        } else if (typeof value === 'object' && value !== null) {
          // Handle nested objects (like artist.name)
          return Object.values(value).some(
            nestedValue => 
              typeof nestedValue === 'string' && 
              nestedValue.toLowerCase().includes(lowerCaseSearch)
          );
        }
        return false;
      }
    });
  });
}
