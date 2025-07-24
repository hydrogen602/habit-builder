import type { Route } from "./+types/home";
import { HabitBuilder } from "../components/HabitBuilder";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Habit Builder" },
    { name: "description", content: "Track your goals and build better habits!" },
  ];
}

export default function Home() {
  return <HabitBuilder />;
}
