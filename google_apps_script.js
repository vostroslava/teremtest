/**
 * Google Apps Script для приёма заявок с лендинга «Теремок»
 * 
 * Инструкция:
 * 1. Создайте новую Google Таблицу
 * 2. Откройте Расширения → Apps Script
 * 3. Вставьте этот код
 * 4. Нажмите "Развернуть" → "Новое развертывание"
 * 5. Выберите тип: "Веб-приложение"
 * 6. Настройте: Выполнять от имени: "Я", Доступ: "Все"
 * 7. Скопируйте URL развертывания и вставьте в index.html (SCRIPT_URL)
 */

const SHEET_NAME = 'Лиды';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    
    const timestamp = new Date();
    const row = [
      timestamp,
      'Лид Теремок',
      data.name || '',
      data.phone || '',
      data.company || '',
      data.position || '',
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
    const headers = ['Дата/время', 'Источник', 'Имя', 'Телефон', 'Компания', 'Должность', 'Статус'];
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
