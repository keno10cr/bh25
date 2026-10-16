"use client";

import { useState } from "react";
import styles from "./tool-access-gate.module.css";

const COPY = {
  en: {
    title: "Team access",
    body: "This tool is for the Blessed House team. Enter the password to continue.",
    label: "Password",
    submit: "Unlock",
    checking: "Checking...",
    wrong: "That password is not right. Please try again.",
    failed: "Could not check the password. Please try again.",
    notConfigured: "The team password is not set up on this server yet.",
    remember: "You will stay signed in on this device for 30 days.",
  },
  es: {
    title: "Acceso del equipo",
    body: "Esta herramienta es para el equipo de Blessed House. Ingrese la contraseña para continuar.",
    label: "Contraseña",
    submit: "Entrar",
    checking: "Verificando...",
    wrong: "La contraseña no es correcta. Intente de nuevo.",
    failed: "No se pudo verificar la contraseña. Intente de nuevo.",
    notConfigured: "La contraseña del equipo aún no está configurada en este servidor.",
    remember: "Su sesión quedará abierta en este dispositivo por 30 días.",
  },
};

export default function ToolAccessGate({ next, language = "en", configured = true }) {
  const copy = COPY[language] || COPY.en;
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(configured ? "" : copy.notConfigured);

  const submit = async (event) => {
    event.preventDefault();
    if (!password || checking || !configured) return;
    setChecking(true);
    setError("");
    try {
      const response = await fetch("/api/tool-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        if (window.location.pathname === next) window.location.reload();
        else window.location.assign(next);
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(
        data.error === "wrongPassword"
          ? copy.wrong
          : data.error === "notConfigured"
            ? copy.notConfigured
            : copy.failed
      );
    } catch {
      setError(copy.failed);
    }
    setChecking(false);
  };

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <img src="/blessedhouse_logo25.png" alt="Villas Blessed House" className={styles.logo} />
        <h1>{copy.title}</h1>
        <p className={styles.body}>{copy.body}</p>
        <label className={styles.field}>
          <span>{copy.label}</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            disabled={!configured}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.submit} disabled={!password || checking || !configured}>
          {checking ? copy.checking : copy.submit}
        </button>
        <p className={styles.remember}>{copy.remember}</p>
      </form>
    </main>
  );
}
