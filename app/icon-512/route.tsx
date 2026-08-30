import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
          background: "#2542b8",
          borderRadius: 106,
        }}
      >
        {config?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logo_url} width={370} height={370} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ color: "#ffffff", fontSize: 290, fontWeight: 700 }}>S</span>
        )}
      </div>
    ),
    { width: 512, height: 512 }
  );
}
