import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase } from "lucide-react";

interface InstallerCardProps {
  name: string;
  location: string;
  rating: number;
  reviews: number;
  specialties: string[];
  image: string;
  projectsCompleted: number;
}

const InstallerCard = ({
  name,
  location,
  rating,
  reviews,
  specialties,
  image,
  projectsCompleted,
}: InstallerCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent overflow-hidden">
      {/* Profile Image */}
      <div className="relative h-48 bg-gradient-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-dark/50" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-sm">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>
        {/* Placeholder geometric pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-cyan-bright/20 border-4 border-white flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {name.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="pt-6">
        {/* Installer Name */}
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Projects Completed */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">{projectsCompleted} Projects Completed</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {specialties.slice(0, 3).map((specialty) => (
            <Badge
              key={specialty}
              variant="secondary"
              className="bg-cyan-pale text-primary border-0"
            >
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Badge variant="outline" className="border-accent text-accent">
              +{specialties.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="default" size="lg" className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InstallerCard;
