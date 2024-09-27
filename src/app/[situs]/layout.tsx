export default function SitusLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    )
  }