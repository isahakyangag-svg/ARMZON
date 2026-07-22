import type { CSSProperties } from 'react';
const card: CSSProperties = { border: '1px solid #2b3440', borderRadius: 16, padding: 20, background: '#161c24' };
export function StatusCard({ title, detail }: Readonly<{ title: string; detail: string }>) { return <article style={card}><strong>{title}</strong><p>{detail}</p></article>; }
