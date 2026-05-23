"use client";

import { SelectField } from "@/components/ui/select-field";
import { useApp } from "@/contexts/app-context";

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <SelectField value={value} onChange={onChange} options={options} />
    </label>
  );
}

export function ContentFormPicks(props: {
  platform: string;
  track: string;
  goal: string;
  style: string;
  onPlatform: (v: string) => void;
  onTrack: (v: string) => void;
  onGoal: (v: string) => void;
  onStyle: (v: string) => void;
}) {
  const { tr } = useApp();
  return (
    <div className="grid gap-3">
      <LabeledSelect
        label={tr("labelPlatform")}
        value={props.platform}
        onChange={props.onPlatform}
        options={[
          tr("platformDouyin"),
          tr("platformXhs"),
          tr("platformChannels"),
          tr("platformKuaishou"),
        ]}
      />
      <LabeledSelect
        label={tr("labelTrack")}
        value={props.track}
        onChange={props.onTrack}
        options={[
          tr("trackLove"),
          tr("trackPet"),
          tr("trackEcom"),
          tr("trackCareer"),
          tr("trackLocal"),
          tr("trackXhs"),
          tr("trackIp"),
        ]}
      />
      <LabeledSelect
        label={tr("labelGoal")}
        value={props.goal}
        onChange={props.onGoal}
        options={[tr("goalFans"), tr("goalTraffic"), tr("goalSales"), tr("goalIp")]}
      />
      <LabeledSelect
        label={tr("labelStyle")}
        value={props.style}
        onChange={props.onStyle}
        options={[
          tr("styleGentle"),
          tr("styleEmotion"),
          tr("stylePractical"),
          tr("styleFunny"),
          tr("styleHeal"),
          tr("styleConvert"),
        ]}
      />
    </div>
  );
}
