"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PaymentRedirect() {
  const router = useRouter();
  const { changeLanguage } = useLanguage();
  
  useEffect(() => {
    changeLanguage("en");
    router.replace("/payments");
  }, [router, changeLanguage]);

  return null;
}



