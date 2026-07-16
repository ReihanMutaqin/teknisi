import { useEffect } from "react";

export function GoogleAd() {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden flex justify-center bg-slate-50 border border-slate-200 rounded-xl p-2 my-6">
      {/* 
        Ganti data-ad-client dan data-ad-slot sesuai dengan kode dari Google AdSense Anda
      */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px", width: "100%", height: "90px" }}
        data-ad-client="ca-pub-5291596525422164"
        data-ad-slot="AUTO"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
