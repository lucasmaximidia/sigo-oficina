import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function AppleIcon() {
  const { data: config } = await supabase.from("configuracoes").select("logo_url").eq("id", 1).single();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {config?.logo_url ? (
          <img src={config.logo_url} width={130} height={130} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ color: "#2542b8", fontSize: 96, fontWeight: 700 }}>S</span>
        )}
      </div>
    ),
    size
  );
}
