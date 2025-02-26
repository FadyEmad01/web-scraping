"use client";
import { ArrowRight, Plus, Search } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/Container";
import ScrapedContent from "@/components/scraped-content";
import { scrapeWebsite } from "./actions";


interface ScrapedData {
  images: string[];
  videos: string[];
  audio: string[];
  iframes: string[];
}

export default function Home() {
  // function convertTikTokUrl(url:string) {
  //   const convertedUrl = decodeURIComponent(url);
  //   console.log(convertedUrl);
  // }

  ///////////////////////////////////////////////////////////////////////////////////////////
  const [url, setUrl] = useState("");
  // const [folderName, setFolderName] = useState("");
  // const [folderLocation, setFolderLocation] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrapedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const scrapePromise = scrapeWebsite(url);

    toast.promise(scrapePromise, {
      loading: "Scraping website...",
      success: "Website scraped successfully!",
      error: "Failed to scrape website",
    });

    try {
      const data = await scrapePromise;
      setScrapedData(data);
    } catch (error) {
      console.error("Error scraping website:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <section className="w-full h-screen">
        <div className="pt-12 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="w-full flex items-center justify-center">
            <div className="flex items-center whitespace-nowrap rounded-full border bg-popover px-3 py-1 text-xs leading-6  text-primary/60 ">
              <div className="flex items-center justify-center gap-1 py-1">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">Try It Now</p>
                {/* <p className="ml-1 flex items-center font-semibold">Explore</p> */}
              </div>
            </div>
          </div>
          <div className="mb-10 mt-4 h-full md:mt-6">
            <div className="px-2 h-full">
              <div className="relative mx-auto h-full max-w-7xl border overflow-hidden">
                <DotPattern className="m-1" />
                <div className="absolute w-full h-full [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)]">
                  <div className="flex select-none flex-col  px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                    <Plus
                      strokeWidth={4}
                      className="text-ali absolute -left-5 -top-5 h-10 w-10"
                    />
                    <Plus
                      strokeWidth={4}
                      className="text-ali absolute -bottom-5 -left-5 h-10 w-10"
                    />
                    <Plus
                      strokeWidth={4}
                      className="text-ali absolute -right-5 -top-5 h-10 w-10"
                    />
                    <Plus
                      strokeWidth={4}
                      className="text-ali absolute -bottom-5 -right-5 h-10 w-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-full h-full p-6 md:px-12 md:py-10">
                  <h1 className="relative text-center text-5xl font-semibold leading-none tracking-tight md:text-8xl lg:text-8xl [mask-image:none]">
                    Your Ultimate Tool for{" "}
                    <AuroraText className="py-2">Downloading</AuroraText>{" "}
                    Website Assets{" "}
                  </h1>
                  <div className="w-full flex items-center justify-center pt-5">
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-2 flex flex-col items-start justify-center"
                    >
                      <Label className="text-base" htmlFor="website">
                        Enter Website URL
                      </Label>
                      <div className="relative">
                        <Input
                          id="website"
                          className="peer pe-9 ps-9 bg-white border-black"
                          placeholder="https://example.com"
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <Search size={16} strokeWidth={2} />
                        </div>
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Submit search"
                          type="submit"
                          disabled={isLoading}
                        >
                          <ArrowRight
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <TikTokEmbed videoId="7472480883216370949" />
      <iframe
        src={`https://www.tiktok.com/embed/7472480883216370949`}
        width="325"
        height="605"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
      <video autoPlay muted loop controls src="https://v9e.tiktokcdn.com/91aee20b2a7b085654305e4f68441336/67b63ffa/video/tos/useast2a/tos-useast2a-ve-0068c004/oEQnIZC9jgPZAuGPULFWetnbeqZINIggSAylCe/?a=1340&bti=OUBzOTg7QGo6OjZAL3AjLTAzYCMxNDNg&ch=0&cr=13&dr=0&er=0&lr=all&net=0&cd=0%7C0%7C0%7C&cv=1&br=738&bt=369&cs=2&ds=3&eid=7936&ft=arF-uqI3mDUPD12xVV.J3wUhaS2RaeF~O5&mime_type=video_mp4&qs=14&rc=NzY3Ojw8aDU3ZjQ0PDo4OEBpamVpa3A5cmtzeDMzNzczM0BeMDEwMGMvNjYxLi1gYl8xYSNjLWpeMmRrXm1gLS1kMTZzcw%3D%3D&vvpl=1&l=20250219043241E9131600F31F0D40D0DA&btag=e000b8000"></video> */}
      <Container>
        {scrapedData && (
          <div ref={targetRef} className="w-full h-screen">
            <ScrapedContent data={scrapedData} />
          </div>
        )}
      </Container>
    </>
  );
}
