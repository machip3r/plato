import type { HeaderGlassProps } from './HeaderGlass.types';

/** Keep the filter outside opacity-animated ancestors so it can sample the page. */
export function HeaderGlass(_props: HeaderGlassProps) {
  return <div aria-hidden="true" style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backdropFilter: 'blur(48px) saturate(160%)',
    WebkitBackdropFilter: 'blur(48px) saturate(160%)',
    backgroundColor: 'rgba(250,246,235,0.64)',
  }} />;
}
