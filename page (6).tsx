import { Suspense } from "react";
import ClientPage from "./ClientPage";
import { Clock } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Clock className="animate-spin inline-block mr-2" /> Cargando expediente...</div>}>
      <ClientPage />
    </Suspense>
  );
}
