export type Preacher = { id: string; name: string; role: string; church: string };

export const PREACHERS: Preacher[] = [
  { id: "yang", name: "양재경", role: "담당목사", church: "용인온누리교회" },
  { id: "leejh", name: "이재훈", role: "위임목사", church: "온누리교회" },
  { id: "leecs", name: "이찬수", role: "담임목사", church: "분당우리교회" },
];

export const findPreacher = (s?: string) => PREACHERS.find((p) => s?.includes(p.name));
