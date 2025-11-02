"use client"
import ContactForm from "@/components/contact-form"
import ContactInfo from "@/components/contact-info"
import styles from "./contact.module.css"

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Get in Touch</h1>
        <p>Have questions? We'd love to hear from you. Contact us anytime.</p>
      </div>

      <div className={styles.content}>
        <ContactForm />
        <ContactInfo />
      </div>
    </div>
  )
}
