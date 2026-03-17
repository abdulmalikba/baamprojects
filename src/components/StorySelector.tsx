import { useStories } from '@/store/useStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StorySelectorProps {
  value: string; // "storyId|phaseNumber"
  onChange: (storyId: string, phaseNumber: number, storyName: string) => void;
}

export default function StorySelector({ value, onChange }: StorySelectorProps) {
  const { stories } = useStories();

  return (
    <div className="col-span-2">
      <Label className="text-xs">Select Story</Label>
      <Select
        value={value}
        onValueChange={(v) => {
          const story = stories.find(s => `${s.storyId}|${s.phaseNumber}` === v);
          if (story) onChange(story.storyId, story.phaseNumber, story.storyName);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a story..." />
        </SelectTrigger>
        <SelectContent>
          {stories.map(s => (
            <SelectItem key={s.id} value={`${s.storyId}|${s.phaseNumber}`}>
              {s.storyId} (Phase {s.phaseNumber}) — {s.storyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
