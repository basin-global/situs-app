import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Situs Protocol</h1>
      <p className="text-xl mb-8">Manage your digital assets across multiple Situs OGs.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/basin/accounts">
          <Button className="w-full h-32 text-lg">Basin Accounts</Button>
        </Link>
        <Link href="/refi/certificates">
          <Button className="w-full h-32 text-lg">ReFi Certificates</Button>
        </Link>
        <Link href="/boulder/currency">
          <Button className="w-full h-32 text-lg">Boulder Currency</Button>
        </Link>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-600">Dynamic content will be added here in the future.</p>
      </div>
    </div>
  )
}