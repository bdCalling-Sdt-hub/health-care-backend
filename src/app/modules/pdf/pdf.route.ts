import express from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

const router = express.Router();

router.post('/generate-pdf', async (req, res) => {
  try {
    const htmlContent = `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Prescription - Dokter For You</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background-color: #eef9ff;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .prescription-form {
      width: 210mm;
      height: 297mm;
      padding: 20px 20px;
      display: flex;
      flex-direction: column;
      height:100dvh;
      justify-content: space-between;
      position: relative;
    }
    .top-wave {
      position: absolute;
      top: -10px;
      left: -20px;
      width: calc(100% + 40px);
      height: 150px;
      z-index: 1;
    }
    .bottom-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      z-index: 1;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
    }
    .logo {
      width: 50px;
      height: 50px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    .logo-text h1 {
      color: #0070C0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .logo-text p {
      color: #40B4AA;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      position: relative;
      z-index: 2;
    }
    .info-item {
      margin-bottom: 15px;
    }
    .info-label {
      font-weight: bold;
      color: #0070C0;
      font-size: 12px;
    }
    .info-value {
      font-size: 14px;
      color: #333;
      padding: 5px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .divider {
      margin: 20px 0;
      height: 1px;
      background-color: #000;
    }
    .prescription-area {
      flex-grow: 1;
      padding: 20px;
      background: #e6f7ff;
      border-radius: 10px;
      border: 1px solid #b3e5fc;
      color: #005075;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .footer {
      padding: 15px;
      background: rgba(0, 112, 192, 0.08);
      border-radius: 10px;
    }
    .pdf-image{
        height: 70px;
    }
    .doctor-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signature-section {
      text-align: right;
    }
    .signature-line {
      width: 200px;
      height: 1px;
      margin-top: 50px;
      background-color: #000;
    }
    .confirmation {
      text-align: center;
      font-size: 12px;
      color: #555;
      padding: 10px;
      background: rgba(64, 180, 170, 0.08);
      border-radius: 10px;
      border: 1px solid rgba(64, 180, 170, 0.2);
      margin-top: 10px;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .prescription-form {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="prescription-form">
    <!-- <svg class="top-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path fill="#113cb1" fill-opacity="0.3" d="M0,160 C480,280 960,200 1440,160 L1440,0 L0,0 Z"></path>
      <path fill="#40B4AA" fill-opacity="0.4" d="M0,120 C480,200 960,120 1440,120 L1440,0 L0,0 Z"></path>
    </svg> -->
    <div class="logo-section">
      <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735388552/pdf_o25ezj.png" class="pdf-image" alt="" srcset="">
    </div>
    <div class="info-grid">
      <div>
        <div class="info-item">
          <span class="info-label">S No:</span>
          <div class="info-value">PRE-2024-001</div>
        </div>
        <div class="info-item">
          <span class="info-label">Patient's Name:</span>
          <div class="info-value">John Smith</div>
        </div>
        <div class="info-item">
          <span class="info-label">Address:</span>
          <div class="info-value">123 Main Street</div>
        </div>
      </div>
      <div>
        <div class="info-item">
          <span class="info-label">Type of Prescription:</span>
          <div class="info-value">General Medicine</div>
        </div>
        <div class="info-item">
          <span class="info-label">Date of Birth:</span>
          <div class="info-value">15/05/1985</div>
        </div>
        <div class="info-item">
          <span class="info-label">Date:</span>
          <div class="info-value">28/12/2024</div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="prescription-area">
      Prescription details go here.
    </div>
    <div class="footer">
      <div class="doctor-section">
        <div>
          <div class="info-item">
            <span class="info-label">DR:</span>
            <div class="info-value">Dr. Sarah Johnson</div>
          </div>
        </div>
        <div class="signature-section">
          <span class="info-label">Signature</span>
          <div class="signature-line"></div>
        </div>
      </div>
      <div class="confirmation">
        <p>I confirm this prescription is based on a valid doctor-patient relationship.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

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
