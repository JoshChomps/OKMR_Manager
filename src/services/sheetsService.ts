/* 
  GOOGLE SHEETS DATA SERVICE
  This service communicates with the Google Apps Script Web App bridge.
*/

// TODO: Replace with your deployed Google Apps Script Web App URL
const SHEETS_API_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL";

export const sheetsService = {
  /**
   * Fetch all data from a specific tab in the Google Sheet
   * @param sheetName The name of the tab (e.g., 'Projects', 'Tasks')
   */
  async fetchData<T>(sheetName: string): Promise<T[]> {
    try {
      const response = await fetch(`${SHEETS_API_URL}?sheet=${encodeURIComponent(sheetName)}`);
      if (!response.ok) throw new Error(`Failed to fetch ${sheetName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error);
      return [];
    }
  },

  /**
   * Append a new row to a specific tab
   * @param sheetName The name of the tab
   * @param data The row data to append
   */
  async appendRow(sheetName: string, data: any): Promise<boolean> {
    try {
      // Map the object to a flat array if needed, or send as object for Apps Script to handle
      const response = await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'append',
          sheet: sheetName,
          row: data
        })
      });
      return response.ok;
    } catch (error) {
      console.error(`Error appending to ${sheetName}:`, error);
      return false;
    }
  }
};
