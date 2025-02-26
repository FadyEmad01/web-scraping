import { useEffect } from "react";

const TikTokEmbed = ({ videoId }: { videoId: string }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <blockquote
      className="tiktok-embed"
      cite="https://www.tiktok.com/"
      data-video-id={videoId}
      style={{ maxWidth: "605px", minWidth: "325px" }}
    >
      <section>Loading TikTok Video...</section>
    </blockquote>
  );
};

export default TikTokEmbed;
