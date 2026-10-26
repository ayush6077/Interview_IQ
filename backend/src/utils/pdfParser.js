const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Parse a PDF file and return its text content.
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<string>} - Extracted text from the PDF.
 */
const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
};

module.exports = { parsePDF };
