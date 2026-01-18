import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  Rocket, Target, TrendingUp, Calendar, BookOpen, 
  Dumbbell, Sparkles, ChevronRight, Check 
} from 'lucide-react';
import { toast } from 'sonner';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    toast.success('Bienvenue sur INITIUM ! 🚀');
    navigate('/');
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const steps = [
    {
      icon: Rocket,
      title: 'Bienvenue sur INITIUM NEXT',
      description: 'Votre second cerveau numérique gamifié',
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            INITIUM transforme votre productivité en une aventure épique.
            Gérez vos objectifs, habitudes et projets tout en progressant comme dans un jeu.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Quêtes</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Progression XP</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Récompenses</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Target,
      title: 'Système de Quêtes',
      description: 'Transformez vos objectifs en quêtes épiques',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Hiérarchie de quêtes</h4>
              <p className="text-sm text-muted-foreground">
                Organisez vos objectifs en quêtes principales et secondaires
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Progression multi-facteur</h4>
              <p className="text-sm text-muted-foreground">
                Suivez votre avancement avec des sous-tâches et jalons
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">XP équilibré</h4>
              <p className="text-sm text-muted-foreground">
                Gagnez des points d'expérience basés sur l'effort et la régularité
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Calendar,
      title: 'Habitudes & Routines',
      description: 'Construisez des habitudes durables',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Suivi des streaks</h4>
              <p className="text-sm text-muted-foreground">
                Maintenez vos séries et battez vos records personnels
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Objectifs hebdomadaires</h4>
              <p className="text-sm text-muted-foreground">
                Définissez des fréquences personnalisées (ex: 5x/semaine)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Visualisation de cohérence</h4>
              <p className="text-sm text-muted-foreground">
                Analysez vos patterns avec graphiques et heatmaps
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: BookOpen,
      title: 'Fonctionnalités avancées',
      description: 'Explorez tout ce qu\'INITIUM offre',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Notes Markdown</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Agenda intelligent</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Gestion de projets</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Analytics détaillés</p>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-6">
            Prêt à commencer votre aventure ?
          </p>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4">
      <Card className="w-full max-w-2xl shadow-2xl border-primary/20">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
            >
              Passer
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-[300px]">
            {currentStep.content}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Précédent
            </Button>
            <Button onClick={nextStep}>
              {step === totalSteps ? (
                <>
                  Commencer <Rocket className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
