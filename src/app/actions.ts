"use server"

export async function scrapeWebsite(url: string) {
  let puppeteer: typeof import("puppeteer-core");
  let browser;

  if (process.env.VERCEL === "1") {
    const chromium = (await import("@sparticuz/chromium")).default;
    puppeteer = await import("puppeteer-core");
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    puppeteer = await import("puppeteer");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });
  }

  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: "networkidle0" })

    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img")).map((img) => img.src)
      const videos = Array.from(document.querySelectorAll("video, video source")).map((video) => {
        if (video instanceof HTMLVideoElement || video instanceof HTMLSourceElement) {
          return video.src
        }
        return null;
      }).filter((src): src is string => src !== null);
      const audio = Array.from(document.querySelectorAll("audio, audio source")).map((audio) => {
        if (audio instanceof HTMLAudioElement || audio instanceof HTMLSourceElement) {
          return audio.src
        }
        return null;
      }).filter((src): src is string => src !== null);
      const iframes = Array.from(document.querySelectorAll("iframe")).map((iframe) => iframe.src);

      return {
        images: Array.from(new Set(images.filter(Boolean))),
        videos: Array.from(new Set(videos.filter(Boolean))),
        audio: Array.from(new Set(audio.filter(Boolean))),
        iframes: Array.from(new Set(iframes.filter(Boolean))),
      }
    })

    await browser.close()

    return {
      images: data.images.filter(Boolean),
      videos: data.videos.filter(Boolean),
      audio: data.audio.filter(Boolean),
      iframes: data.iframes.filter(Boolean),
    }
  } catch (error) {
    await browser.close()
    console.error("Error scraping website:", error)
    throw new Error("Failed to scrape website")
  }
}
