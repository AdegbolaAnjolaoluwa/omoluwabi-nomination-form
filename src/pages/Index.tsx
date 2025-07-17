
import NominationForm from "@/components/NominationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Omoluwabi Golfers Club
          </h1>
          <p className="text-lg text-muted-foreground">
            Election Nomination Form
          </p>
        </div>
        <NominationForm />
      </div>
    </div>
  );
};

export default Index;
