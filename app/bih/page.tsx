// BiH rubrika je uklonjena — portal je fokusiran na Njemačku, svijet i sport.
// Stara /bih adresa preusmjerava na naslovnu (da stari linkovi ne pucaju).
import { redirect } from "next/navigation";

export default function BihPage() {
  redirect("/");
}
