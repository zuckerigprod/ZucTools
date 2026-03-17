export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          Сделано с{" "}
          <span className="inline-block animate-pulse text-accent">&#10084;</span>{" "}
          <a
            href="https://t.me/ZuckerigProd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-pink hover:text-accent transition-colors underline underline-offset-4"
          >
            ZuckerigProd
          </a>
        </p>
      </div>
    </footer>
  )
}
