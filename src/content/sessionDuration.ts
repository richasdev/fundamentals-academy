import { lessons, type LabId } from "./lessons";
import { chapterDetails } from "./chapterDetails";
import { teachingGuides } from "./teachingGuides";
import { studySessions } from "./studySessions";
function words(value: unknown): number {
  if (typeof value === "string")
    return value.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value))
    return value.reduce((sum, item) => sum + words(item), 0);
  if (value && typeof value === "object")
    return Object.values(value).reduce<number>(
      (sum, item) => sum + words(item),
      0,
    );
  return 0;
}
export function sessionDuration(id: LabId) {
  const lesson = lessons[id];
  const wordCount = words([
    lesson.concept,
    lesson.deep,
    lesson.practical,
    chapterDetails[id],
    teachingGuides[id],
    studySessions[id],
  ]);
  const reading: [number, number] = [
    Math.ceil(wordCount / 220),
    Math.ceil(wordCount / 170),
  ];
  const practice: [number, number] = [21, 27]; // duas investigações + registro por aula
  const reflection: [number, number] = [3, 6];
  const capstone: [number, number] = [5, 7];
  return {
    wordCount,
    reading,
    practice,
    reflection,
    capstone,
    min: reading[0] + 29,
    max: reading[1] + 40,
  };
}
