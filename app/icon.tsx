import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Icon() {
  const supabase = await createClient();
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
          borderRadius: 7,
        }}
      >
        {config?.logo_url ? (
          <img src={config.logo_url} width={24} height={24} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ color: "#2542b8", fontSize: 20, fontWeight: 700 }}>S</span>
        )}
      </div>
    ),
    size
  );
}
