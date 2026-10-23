// Identifica dispositivo/navegador a partir do user-agent de forma legível
// (ex.: "iPhone · Safari"), sem depender de nenhuma lib externa — cobre os
// casos comuns o suficiente pra exibir no contrato, não precisa ser exato.
export function identificarDispositivo(userAgent: string): string {
  let dispositivo = "Dispositivo desconhecido";
  if (/ipad/i.test(userAgent)) dispositivo = "iPad";
  else if (/iphone/i.test(userAgent)) dispositivo = "iPhone";
  else if (/android/i.test(userAgent)) dispositivo = "Android";
  else if (/windows/i.test(userAgent)) dispositivo = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) dispositivo = "Mac";
  else if (/linux/i.test(userAgent)) dispositivo = "Linux";

  let navegador = "";
  if (/edg\//i.test(userAgent)) navegador = "Edge";
  else if (/samsungbrowser/i.test(userAgent)) navegador = "Samsung Internet";
  else if (/crios\//i.test(userAgent)) navegador = "Chrome";
  else if (/fxios\//i.test(userAgent) || /firefox\//i.test(userAgent)) navegador = "Firefox";
  else if (/chrome\//i.test(userAgent)) navegador = "Chrome";
  else if (/safari\//i.test(userAgent)) navegador = "Safari";

  return navegador ? `${dispositivo} · ${navegador}` : dispositivo;
}
