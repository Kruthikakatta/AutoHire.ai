const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

// Parse resume from uploaded file (PDF or DOCX)
const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (ext === '.docx' || ext === '.doc') {
    const docx2txt = require('docx2txt');
    text = await new Promise((resolve, reject) => {
      docx2txt.process(filePath, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  return {
    rawText: text,
    sections: extractSections(text)
  };
};

// Extract sections from resume text
const extractSections = (text) => {
  return {
    skills: text.match(/(?:skills|technologies)[:\s\n]+([\s\S]+?)(?:\n\n|\n[A-Z])/i)?.[1] || '',
    experience: text.match(/(?:experience|work history)[:\s\n]+([\s\S]+?)(?:\n\n|\n[A-Z])/i)?.[1] || '',
    education: text.match(/education[:\s\n]+([\s\S]+?)(?:\n\n|\n[A-Z])/i)?.[1] || '',
    summary: text.match(/(?:summary|objective|profile)[:\s\n]+([\s\S]+?)(?:\n\n|\n[A-Z])/i)?.[1] || ''
  };
};

module.exports = { parseResume };
