"use client";

import { useState } from "react";
import { downloadFiles } from "@/app/actions";
import { toast } from "react-hot-toast";
import { Checkbox } from "./ui/checkbox";

type ScrapedData = {
  images: string[];
  videos: string[];
  audio: string[];
  iframes: string[];
};

export default function ScrapedContent({
  data,
  folderName,
  folderLocation,
}: {
  data: ScrapedData;
  folderName?: string;
  folderLocation?: string;
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleItem = (url: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const handleDownload = async (urls: string[]) => {
    setIsDownloading(true);
    const downloadPromise = downloadFiles(urls, folderName, folderLocation);

    toast.promise(downloadPromise, {
      loading: "Downloading files...",
      success: (path) => `Files downloaded successfully to: ${path}`,
      error: "Failed to download files",
    });

    try {
      await downloadPromise;
    } catch (error) {
      console.error("Error downloading files:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSelected = () => handleDownload(Array.from(selectedItems));
  const downloadAll = (type: keyof ScrapedData) => handleDownload(data[type]);
  const downloadAllTypes = () => handleDownload(Object.values(data).flat());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Scraped Content</h2>
      <div className="flex space-x-2">
        <button
          onClick={downloadSelected}
          disabled={isDownloading || selectedItems.size === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          Download Selected ({selectedItems.size})
        </button>
        <button
          onClick={downloadAllTypes}
          disabled={isDownloading}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          Download All ({Object.values(data).flat().length})
        </button>
      </div>
      {Object.entries(data).map(([type, urls]) => (
        <>
          {urls.length > 0 && (
            <div key={type} className="space-y-4">
              <h3 className="text-xl font-semibold capitalize">
                {type} ({urls.length})
              </h3>
              <button
                onClick={() => downloadAll(type as keyof ScrapedData)}
                disabled={isDownloading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Download All {type}
              </button>
              {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> */}
              <div className="columns-2 md:columns-3 lg:columns-4">
                {urls.map((url) => (
                  <div
                    key={url}
                    className="inline-block mb-4 w-full rounded-md transition duration-300 ease-in-out"
                  >
                    <div className="relative flex cursor-pointer flex-col rounded-lg border-2 border-transparent p-2 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:border-2">
                      {type === "images" && (
                        <img
                          src={url || "/placeholder.svg"}
                          alt="Scraped"
                          className="relative w-full h-full object-cover rounded-sm"
                        />
                      )}
                      {type === "videos" && (
                        <>
                          <video
                            autoPlay
                            loop
                            muted
                            src={url}
                            className="w-full aspect-video object-cover rounded-sm"
                          />
                        </>
                      )}
                      {type === "audio" && (
                        <audio
                          src={url}
                          controls
                          className="w-full rounded-sm"
                        />
                      )}
                      {type === "iframes" && (
                        <iframe src={url} className="w-full rounded-sm" />
                      )}
                      {/* <Checkbox
                      id={decodeURIComponent(url)}
                      value={decodeURIComponent(url)}
                      checked={selectedItems.has(url)}
                      onCheckedChange={() => toggleItem(url)}
                      className="order-1 after:absolute after:inset-2 opacity-0
                      rounded-full size-6 border-primary data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                    /> */}
                      {/* <input
                      type="checkbox"
                      id={decodeURIComponent(url)}
                      value={decodeURIComponent(url)}
                      checked={selectedItems.has(url)}
                      onChange={() => toggleItem(url)}
                      className="absolute w-full h-full order-1 after:absolute after:inset-2 opacity-0
                      rounded-full size-6 border-primary data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                    /> */}
                      <Checkbox
                        id={decodeURIComponent(url)}
                        value={decodeURIComponent(url)}
                        checked={selectedItems.has(url)}
                        onCheckedChange={() => toggleItem(url)}
                        className="absolute top-0 right-0 w-full h-full z-50 order-1  opacity-0
                     border-primary data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                    </div>

                    {/* <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(url)}
                    onChange={() => toggleItem(url)}
                    className="mr-2"
                  />
                  <span className="text-sm truncate">
                    {decodeURIComponent(url) || url.split("/").pop()}
                  </span>
                </div> */}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  );
}
