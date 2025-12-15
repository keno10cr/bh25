"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PagosRedirect() {
  const router = useRouter();
  const { changeLanguage } = useLanguage();
  
  useEffect(() => {
    changeLanguage("es");
    router.replace("/payments");
  }, [router, changeLanguage]);

  return null;
}




