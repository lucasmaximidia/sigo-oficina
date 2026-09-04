import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
          borderRadius: 40,
        }}
      >
        {config?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logo_url} width={140} height={140} style={{ objectFit: "contain" }} alt="" />
        ) : (
          <span style={{ color: "#2542b8", fontSize: 110, fontWeight: 700 }}>S</span>
        )}
      </div>
    ),
    { width: 192, height: 192 }
  );
}
