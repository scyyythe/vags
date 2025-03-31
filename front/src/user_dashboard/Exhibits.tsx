import Header from "@/components/user_dashboard/Header";
import Hero from "@/components/user_dashboard/Hero";

const Exhibits = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12 no-scrollbar overflow-y-auto max-h-screen">
        <Hero 
          title="Exhibits" 
          subtitle="Coming soon" 
        />
        
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Exhibits Dashboard</h2>
            <p className="text-muted-foreground">
              This section is currently under development.
              <br />
              Check back soon for exciting exhibits and showcases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exhibits;