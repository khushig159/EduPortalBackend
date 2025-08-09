const fs=require('fs')
const pdfParse=require('pdf-parse')
const mammoth=require('mammoth')

async function extractTextFromResume(filePath){
    if(filePath.endsWith('.pdf')){
        const dataBuffer=fs.readFileSync(filePath)
        const data=await pdfParse(dataBuffer);
        return data.text
    }
    else if(filePath.endsWith('.docx')){
        const result=await mammoth.extractRawText({path:filePath})
        return result.value
    }
    else if (/\.(png|jpe?g)$/i.test(filePath)) {
        const result = await Tesseract.recognize(filePath, 'eng', {
            logger: m => console.log(m) // Optional: logs progress
        });
        return result.data.text;
    } 
    else{
        throw new Error("Unsupported file format. Upload PDF or DOCX.");
    }
}
module.exports = extractTextFromResume;
