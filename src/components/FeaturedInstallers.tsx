import InstallerCard from "./InstallerCard";

const sampleInstallers = [
  {
    name: "SignCraft Pro",
    location: "Johannesburg, Gauteng",
    rating: 4.9,
    reviews: 127,
    specialties: ["Cladding", "Vinyl Graphics", "3D Lettering"],
    image: "",
    projectsCompleted: 245,
  },
  {
    name: "Precision Signs",
    location: "Cape Town, Western Cape",
    rating: 4.8,
    reviews: 98,
    specialties: ["Light Box", "Pylon Signs", "Digital Signage"],
    image: "",
    projectsCompleted: 189,
  },
  {
    name: "Elite Signage Solutions",
    location: "Durban, KwaZulu-Natal",
    rating: 5.0,
    reviews: 156,
    specialties: ["Monument Signs", "Directional Signs", "Plinths"],
    image: "",
    projectsCompleted: 312,
  },
];

const FeaturedInstallers = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Installers
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Top-rated professionals ready to bring your signage vision to life
          </p>
        </div>

        {/* Installer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {sampleInstallers.map((installer) => (
            <InstallerCard key={installer.name} {...installer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstallers;
