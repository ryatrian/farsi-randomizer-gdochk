
import { read, utils } from 'xlsx';

export interface ParseResult {
  success: boolean;
  texts: string[];
  error?: string;
}

export class ExcelParser {
  static validateFileType(fileName: string): boolean {
    const validExtensions = ['.xlsx', '.xls'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }

  static async parseFile(fileUri: string): Promise<ParseResult> {
    try {
      console.log('Starting to parse Excel file:', fileUri);
      
      // Read the file
      const response = await fetch(fileUri);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('File loaded, size:', arrayBuffer.byteLength);
      
      // Parse the workbook
      const workbook = read(arrayBuffer, { type: 'array' });
      console.log('Workbook parsed, sheets:', workbook.SheetNames);
      
      if (workbook.SheetNames.length === 0) {
        return {
          success: false,
          texts: [],
          error: 'فایل اکسل هیچ شیتی ندارد',
        };
      }

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      console.log('Processing first sheet:', firstSheetName);

      // Convert to JSON array
      const jsonData = utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false,
      });
      
      console.log('JSON data extracted, rows:', jsonData.length);

      // Extract first column texts
      const firstColumnTexts: string[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row && row.length > 0) {
          const cellValue = row[0];
          if (cellValue && typeof cellValue === 'string') {
            const trimmedText = cellValue.trim();
            if (trimmedText.length > 0) {
              firstColumnTexts.push(trimmedText);
            }
          }
        }
      }

      console.log('Extracted texts:', firstColumnTexts.length);

      if (firstColumnTexts.length === 0) {
        return {
          success: false,
          texts: [],
          error: 'هیچ متن معتبری در ستون اول یافت نشد',
        };
      }

      return {
        success: true,
        texts: firstColumnTexts,
      };

    } catch (error) {
      console.log('Error parsing Excel file:', error);
      return {
        success: false,
        texts: [],
        error: error instanceof Error ? error.message : 'خطای نامشخص در پردازش فایل',
      };
    }
  }

  static async parseFileFromBase64(base64Data: string): Promise<ParseResult> {
    try {
      // Convert base64 to array buffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const workbook = read(bytes, { type: 'array' });
      
      if (workbook.SheetNames.length === 0) {
        return {
          success: false,
          texts: [],
          error: 'فایل اکسل هیچ شیتی ندارد',
        };
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false,
      });

      const firstColumnTexts: string[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row && row.length > 0) {
          const cellValue = row[0];
          if (cellValue && typeof cellValue === 'string') {
            const trimmedText = cellValue.trim();
            if (trimmedText.length > 0) {
              firstColumnTexts.push(trimmedText);
            }
          }
        }
      }

      if (firstColumnTexts.length === 0) {
        return {
          success: false,
          texts: [],
          error: 'هیچ متن معتبری در ستون اول یافت نشد',
        };
      }

      return {
        success: true,
        texts: firstColumnTexts,
      };

    } catch (error) {
      console.log('Error parsing Excel from base64:', error);
      return {
        success: false,
        texts: [],
        error: error instanceof Error ? error.message : 'خطای نامشخص در پردازش فایل',
      };
    }
  }
}
