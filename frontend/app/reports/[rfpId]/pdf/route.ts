import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import api from "../../../../lib/api";
import path from "path";
import fs from "fs";

export async function GET(request: Request, { params }: any) {
  const rfpId = params?.rfpId;

  if (!rfpId) {
    return NextResponse.json({ error: "rfpId is missing" }, { status: 400 });
  }

  try {
    // ⭐ 1. FETCH REPORT DATA
    const res = await api.get(`/api/reports/${rfpId}`);
    const { rfp, results } = res.data;

    if (!rfp) {
      return NextResponse.json({ error: "RFP not found" }, { status: 404 });
    }

    // ⭐ 2. CREATE HTML TEMPLATE
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          h1 { font-size: 24px; }
          .vendor { border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Report - ${rfp.title}</h1>
        <p><strong>ID:</strong> ${rfp._id}</p>
        <p><strong>Budget:</strong> ${rfp.budget ?? "N/A"}</p>
        <p><strong>Delivery:</strong> ${rfp.delivery_timeline ?? "N/A"}</p>

        <h2>Vendor Comparison</h2>
        ${results
          .map(
            (r, i) => `
            <div class="vendor">
              <h3>${i + 1}. ${r.vendorName} (${r.vendorEmail})</h3>
              <p>Total Score: ${r.totalScore}</p>
              <p>Price Score: ${r.scores.priceScore}</p>
              <p>Delivery Score: ${r.scores.deliveryScore}</p>
              <p>Warranty Score: ${r.scores.warrantyScore}</p>
              <p>Item Score: ${r.scores.itemScore}</p>
            </div>
          `
          )
          .join("")}
      </body>
      </html>
    `;

    // ⭐ 3. LAUNCH PUPPETEER (WINDOWS READY)
    const exePath = `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;

    if (!fs.existsSync(exePath)) {
      return NextResponse.json(
        {
          error: "Chrome executable not found!",
          fix: "Install Google Chrome at default location.",
        },
        { status: 500 }
      );
    }

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: exePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // ⭐ 4. GENERATE PDF
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    // ⭐ 5. SEND PDF FILE BACK
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${rfpId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF ERROR:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.toString() },
      { status: 500 }
    );
  }
}
