import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { period } = await req.json();

    // Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the statement page
    const url = `${Deno.env.get('APP_URL')}/statement?period=${period}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for charts to render
    await page.waitForSelector('.chart-container', { timeout: 10000 });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="time-statement-${period}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});