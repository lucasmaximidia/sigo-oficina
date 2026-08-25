import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#045d72",
          borderRadius: 106,
          color: "#ffffff",
          fontSize: 290,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { width: 512, height: 512 }
  );
}
