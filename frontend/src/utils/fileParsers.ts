"use client";

import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

// Set the worker source for pdfjs-dist
// This is necessary for pdfjs to work in a web environment
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Parses a DOCX file and extracts its raw text content.
 * @param file The DOCX file to parse.
 * @returns A promise that resolves with the extracted text content.
 */
export async function parseDocx(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        resolve(result.value);
      } catch (error) {
        reject(new Error("Failed to parse DOCX file."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read DOCX file."));
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses a PDF file and extracts its text content from all pages.
 * @param file The PDF file to parse.
 * @returns A promise that resolves with the concatenated text content from all pages.
 */
export async function parsePdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }
        resolve(fullText);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        reject(new Error("Failed to parse PDF file. Ensure it's a valid PDF."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read PDF file."));
    };
    reader.readAsArrayBuffer(file);
  });
}