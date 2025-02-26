"use server"

import puppeteer from "puppeteer-extra"
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path"
import fs from "fs/promises"
import * as fsFady from "fs";
import os from "os"
import https from "https"
import http from "http"

// puppeteer.use(StealthPlugin());


export async function scrapeWebsite(url: string) {
  // const browser = await puppeteer.launch()
  const browser = await puppeteer.launch({
    headless: true, // Use "new" for better performance in latest Puppeteer versions
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
  });
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: "networkidle0" })

    // Scroll through the page to trigger lazy-loading
    
    // await autoScroll(page);

    // Wait for dynamically loaded content
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img")).map((img) => img.src)
      const videos = Array.from(document.querySelectorAll("video, video source")).map((video) => {
        if (video instanceof HTMLVideoElement || video instanceof HTMLSourceElement) {
          return video.src
        }
        return null;
      }).filter((src): src is string => src !== null); // Remove null values
      const audio = Array.from(document.querySelectorAll("audio, audio source")).map((audio) => {
        if (audio instanceof HTMLAudioElement || audio instanceof HTMLSourceElement) {
          return audio.src
        }
        return null;
      }).filter((src): src is string => src !== null); // Remove null values
      const iframes = Array.from(document.querySelectorAll("iframe")).map((iframe) => iframe.src);


      return {
        images: Array.from(new Set(images.filter(Boolean))), // Remove duplicates
        videos: Array.from(new Set(videos.filter(Boolean))),
        audio: Array.from(new Set(audio.filter(Boolean))),
        iframes: Array.from(new Set(iframes.filter(Boolean))),
      }
    })

    await browser.close()

    // const proxyBaseUrl ='http://localhost:3000/api/proxy?url=';
    // const proxyBaseUrl ='https://web-scraping-cyan.vercel.app/api/proxy?url=';
    // const proxyBaseUrl ='';

    return {
      images: data.images.filter(Boolean),
      videos: data.videos.filter(Boolean),
      audio: data.audio.filter(Boolean),
      iframes: data.iframes.filter(Boolean),
    }
    // return {
    //   images: data.images.map((url) => `${proxyBaseUrl}${encodeURIComponent(url)}`),
    //   videos: data.videos.map((url) => `${proxyBaseUrl}${encodeURIComponent(url)}`),
    //   audio: data.audio.map((url) => `${proxyBaseUrl}${encodeURIComponent(url)}`),
    //   iframes: data.iframes.map((url) => `${proxyBaseUrl}${encodeURIComponent(url)}`),
    // };
    // return {
    //   images: data.images.map((url) => `${proxyBaseUrl}${decodeURIComponent(url)}`),
    //   videos: data.videos.map((url) => `${proxyBaseUrl}${decodeURIComponent(url)}`),
    //   audio: data.audio.map((url) => `${proxyBaseUrl}${decodeURIComponent(url)}`),
    //   iframes: data.iframes.map((url) => `${proxyBaseUrl}${decodeURIComponent(url)}`),
    // };
  } catch (error) {
    await browser.close()
    console.error("Error scraping website:", error)
    throw new Error("Failed to scrape website")
  }
}

// Function to scroll through the page to trigger lazy-loaded media
// async function autoScroll(page: puppeteer.Page): Promise<void> {
//   console.log("Scrolling through the page...")
//   console.log(page)
//   await page.evaluate(async () => {
//     await new Promise<void>((resolve) => {
//       let totalHeight = 0;
//       const distance = 500; // Scroll 500px at a time
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 300);
//     });
//   });
// }

export async function downloadFiles(urls: string[], folderName = "WebScraper" , folderLocation = "Downloads") {
  // Use the system's Downloads folder
  const downloadsFolder = path.join(os.homedir(), folderLocation, folderName)
  await fs.mkdir(downloadsFolder, { recursive: true })

  try {
    for (const url of urls) {
      const fileName = url.split("/").pop()?.split("?")[0] || "download"
      const filePath = path.join(downloadsFolder, fileName)

      await downloadFile(url, filePath)
    }

    return downloadsFolder
  } catch (error) {
    console.error("Error downloading files:", error)
    throw new Error("Failed to download files")
  }
}

async function downloadFile(url: string, filePath: string) {
  return new Promise<void>((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${url} (Status: ${response.statusCode})`))
        return
      }

      const fileStream = fsFady.createWriteStream(filePath)
      response.pipe(fileStream)

      fileStream.on("finish", () => {
        fileStream.close()
        resolve()
      })

      fileStream.on("error", (err) => {
        reject(err)
      })
    }).on("error", (err) => {
      reject(err)
    })
  })
}
