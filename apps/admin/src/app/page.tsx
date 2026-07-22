import { StatusCard } from '@marketplace/ui';
export default function Dashboard() { return <main><p className="eyebrow">OPERATIONS</p><h1>Marketplace control center</h1><section><StatusCard title="API" detail="Awaiting local services" /><StatusCard title="Moderation" detail="Domain planned for stage 40" /></section></main>; }
