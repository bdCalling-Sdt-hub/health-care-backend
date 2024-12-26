import express from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const router = express.Router();

router.post('/generate-pdf', async (req, res) => {
  try {
    const { htmlContent } = req.body;

    // Create PDF directory if not exists
    const pdfDir = path.join(process.cwd(), 'uploads', 'pdfFiles');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `pdf-${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    // Save PDF to file
    fs.writeFileSync(filePath, pdf);

    // Return file path
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        filePath: `/pdfFiles/${fileName}`,
      },
    });
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to generate PDF'
    );
  }
});

export const PdfRouter = router;
