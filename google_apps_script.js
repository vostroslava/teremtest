/**
 * Google Apps Script для приёма заявок с лендинга «Теремок»
 */

const SHEET_NAME = 'Лиды';

function doPost(e) {
  try {
    let data;
    
    // Handle both JSON and FormData
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // If JSON parsing fails, try to get from parameters
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }
    
    const sheet = getOrCreateSheet();
    
    const timestamp = new Date();
    const row = [
      timestamp,
      'Лид Теремок',
      data.name || '',
      data.phone || '',
      data.company || '',
      data.position || '',
      data.test_main_type || '',
      data.test_main_text || '',
      'Новый'
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Заявка принята' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Скрипт работает' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['Дата/время', 'Источник', 'Имя', 'Телефон', 'Компания', 'Должность', 'Тест тип', 'Тест текст', 'Статус'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4a90d9').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: 'Тест',
        phone: '+375291234567',
        company: 'Компания',
        position: 'Директор'
      })
    }
  };
  const result = doPost(testData);
  Logger.log(result.getContent());
}
