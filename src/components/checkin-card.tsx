"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockQuestions } from "@/lib/data";
import { Loader2 } from "lucide-react";

const question = mockQuestions.find(q => q.status === 'active' && q.isPriority) ?? mockQuestions[0];

export function CheckinCard() {
    const [state, setState] = useState<'idle' | 'question' | 'answered'>('idle');
    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheckIn = () => {
        setIsLoading(true);
        setTimeout(() => {
            setState('question');
            setIsLoading(false);
        }, 500);
    };

    const handleSubmit = () => {
        setIsLoading(true);
        setTimeout(() => {
            const correct = answer.toLowerCase() === question.answer.toLowerCase();
            setIsCorrect(correct);
            setState('answered');
            setIsLoading(false);
            if(correct) {
                toast({
                    title: "Correct!",
                    description: `You've earned ${question.points} points.`,
                });
            } else {
                 toast({
                    title: "Incorrect",
                    description: `The correct answer was: ${question.answer}. Better luck next time!`,
                    variant: "destructive",
                });
            }
        }, 1000);
    };
    
    const handleReset = () => {
        setAnswer('');
        setIsCorrect(null);
        setState('idle');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {state === 'idle' && 'Ready for today?'}
                    {state === 'question' && 'Question of the Day'}
                    {state === 'answered' && 'Result'}
                </CardTitle>
            </CardHeader>
            <CardContent style={{ minHeight: '150px' }}>
                {state === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <p className="text-muted-foreground">Click the button below to get your daily question.</p>
                        <Button size="lg" onClick={handleCheckIn} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Check-in Now
                        </Button>
                    </div>
                )}
                {state === 'question' && (
                    <div className="space-y-4">
                        <p className="text-lg font-semibold">{question.questionText}</p>
                        <Input 
                            placeholder="Your answer..." 
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={isLoading}
                        />
                         <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Answer
                        </Button>
                    </div>
                )}
                {state === 'answered' && (
                     <div className="flex flex-col items-center justify-center h-full gap-4">
                        {isCorrect ? (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">Correct!</p>
                                <p className="text-muted-foreground">You've earned {question.points} points. Come back tomorrow!</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-destructive">Incorrect!</p>
                                <p className="text-muted-foreground">The correct answer was: <strong className="text-foreground">{question.answer}</strong></p>
                            </div>
                        )}
                        <Button onClick={handleReset} variant="outline">Try again tomorrow</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
