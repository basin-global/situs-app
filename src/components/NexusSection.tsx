import Image from 'next/image';

const nexusItems = [
  { title: 'Investable', description: 'Attract and deploy aligned capital.' },
  { title: 'Legacy', description: 'Secure and bequeath perpetual value.' },
  { title: 'Adaptive', description: 'Tailor and utilize to fit your needs.' },
  { title: 'Grounded', description: 'Empower local, grassroots initiatives.' },
  { title: 'Expansive', description: 'Individual growth fuels collective prosperity.' },
  { title: 'Valuable', description: 'Manage and exchange any form of value.' },
  { title: 'Impact', description: 'Evaluate and articulate the impact of your initiatives.' },
  { title: 'Beautiful', description: 'All value is relative: value what you love.' },
  { title: 'Neutral', description: 'Flexible scale, applicable anywhere.' },
  { title: 'Distributed', description: 'Collaborative networked communities.' },
  { title: 'Sovereign', description: 'Uphold autonomy for individuals and groups.' },
  { title: 'Plural', description: 'Foster relationships across and within species.' },
];

export default function NexusSection() {
  return (
    <section className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-mono font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Climate-Biodiversity-Social Nexus
        </h2>
        <p className="text-2xl text-center mb-16 max-w-3xl mx-auto">
          Society and the economy are 100% reliant on nature.<br/><br/> SITUS operates at the core of our intertwined climate, biodiversity, and social systems to mitigate risks and ensure resilience in the face of rapid change.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"> {/* Changed gap-y-12 to gap-y-16 */}
          {nexusItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Image
                  src={`/assets/icons/nexus/${item.title.toLowerCase()}.png`}
                  alt={`${item.title} icon`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain dark:invert dark:brightness-0"
                />
              </div>
              <div className="flex-grow -mt-1"> {/* Changed pt-1 to -mt-1 */}
                <h3 className="text-2xl font-bold leading-tight">{item.title}</h3>
                <p className="text-base mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
