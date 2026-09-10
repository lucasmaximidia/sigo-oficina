import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

// Substitui o padrão duplicado "tabela no desktop + lista de cards no
// mobile" que se repetia em cada lista do app (uma marcação por breakpoint,
// mantidas manualmente em sincronia). Aqui o mapeamento dos itens e o
// estado vazio ficam num só lugar — só a forma de cada linha (renderRow) e
// de cada card (renderCard) varia por lista.
export function ResponsiveList<T>({
  items,
  header,
  renderRow,
  renderCard,
  colSpan,
  empty,
}: {
  items: T[];
  header: ReactNode;
  renderRow: (item: T) => ReactNode;
  renderCard: (item: T) => ReactNode;
  colSpan: number;
  empty: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>{header}</TableRow>
          </TableHeader>
          <TableBody>
            {items.map(renderRow)}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan}>{empty}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col divide-y divide-border md:hidden">
        {items.map(renderCard)}
        {items.length === 0 && empty}
      </div>
    </>
  );
}
