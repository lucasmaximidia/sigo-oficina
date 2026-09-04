import { Document, Page, Image, StyleSheet } from "@react-pdf/renderer";

// ETIQUETA_PECA_LARGURA/ALTURA (500x300px) equivalem a 50x30mm a 10px/mm.
const MM_PARA_PT = 72 / 25.4;
const LARGURA_PT = 50 * MM_PARA_PT;
const ALTURA_PT = 30 * MM_PARA_PT;

const styles = StyleSheet.create({
  page: { padding: 0 },
  imagem: { width: "100%", height: "100%" },
});

export function EtiquetasPecasPdf({ imagensDataUri }: { imagensDataUri: string[] }) {
  return (
    <Document>
      {imagensDataUri.map((src, index) => (
        <Page key={index} size={[LARGURA_PT, ALTURA_PT]} style={styles.page}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
          <Image src={src} style={styles.imagem} />
        </Page>
      ))}
    </Document>
  );
}
