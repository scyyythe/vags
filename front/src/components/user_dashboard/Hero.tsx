interface HeroProps {
    title: string;
    subtitle?: string;
    imageUrl?: string;
  }
  
  const Hero = ({ title, subtitle, imageUrl }: HeroProps) => {
    if (imageUrl) {
      return (
        <div className="relative w-full h-[400px] mb-8 overflow-hidden rounded-3xl">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-lg text-white/90">{subtitle}</p>}
          </div>
        </div>
      );
    }
  
    return (
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>}
      </div>
    );
  };
  
  export default Hero;
  